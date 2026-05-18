const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const redis = require('./redis')
const emailService = require('./emailService')
const partnerPlatform = require('./partnerPlatform')

const prisma = new PrismaClient()
const CODE_TTL_SECONDS = 48 * 60 * 60

function generateCode(teacherName) {
  const initials = teacherName
    .split(' ')
    .filter((w) => w.match(/^[A-Za-z]/))
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join('')
  const year = new Date().getFullYear()
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `EDU-${initials}-${year}-${random}`
}

async function createUniqueCode(teacherName) {
  for (let i = 0; i < 5; i++) {
    const code = generateCode(teacherName)
    const existing = await prisma.discountCode.findUnique({ where: { code } })
    if (!existing) return code
  }
  throw new Error('Failed to generate unique code after 5 attempts')
}

async function checkEmailRateLimit(studentEmail, teacherId) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const count = await prisma.discountCode.count({
    where: { studentEmail, teacherId, createdAt: { gte: since } },
  })
  return count >= 3
}

async function generateDiscountCode({ schoolId, subjectId, teacherId, studentEmail }) {
  // Validate chain
  const teacher = await prisma.teacher.findFirst({
    where: { id: teacherId, subjectId, isActive: true, subject: { schoolId, isActive: true } },
    include: { subject: { include: { school: true } } },
  })
  if (!teacher) throw Object.assign(new Error('Invalid selection'), { status: 400 })

  // Rate limit per email + teacher
  const limited = await checkEmailRateLimit(studentEmail, teacherId)
  if (limited) throw Object.assign(new Error('You have reached the daily limit for this teacher'), { status: 429 })

  // Pricing snapshot
  const originalPrice = teacher.coursePrice
  const finalPrice = originalPrice - Math.round(originalPrice * teacher.discountPct / 100)
  const currency = process.env.DEFAULT_CURRENCY || 'EGP'

  // Generate unique code
  const code = await createUniqueCode(teacher.name)
  const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000)

  // Persist to DB
  const discountCode = await prisma.discountCode.create({
    data: {
      teacherId,
      studentEmail,
      code,
      originalPrice,
      discountPct: teacher.discountPct,
      finalPrice,
      currency,
      expiresAt,
      status: 'ACTIVE',
    },
  })

  // Cache in Redis (optional — app works without it)
  try { await redis.set(`code:${discountCode.id}`, 'ACTIVE', 'EX', CODE_TTL_SECONDS) } catch { /* Redis unavailable */ }

  // Send email + notify partner (async, don't block response)
  setImmediate(async () => {
    try {
      await emailService.sendCodeEmail({
        to: studentEmail,
        code,
        teacherName: teacher.name,
        schoolName: teacher.subject.school.name,
        subjectName: teacher.subject.name,
        discountPct: teacher.discountPct,
        originalPrice,
        finalPrice,
        currency,
        expiresAt,
      })
    } catch (e) {
      console.error('[Email] Failed:', e.message)
    }

    try {
      await partnerPlatform.registerCode({
        code,
        teacherId: teacher.platformTeacherId,
        discountPct: teacher.discountPct,
        studentEmail,
        expiresAt,
      })
    } catch (e) {
      console.error('[Partner] Failed:', e.message)
    }
  })

  return {
    codeId: discountCode.id,
    code,
    discountPct: teacher.discountPct,
    originalPrice,
    finalPrice,
    currency,
    expiresAt,
    teacherName: teacher.name,
    schoolName: teacher.subject.school.name,
    subjectName: teacher.subject.name,
  }
}

module.exports = { generateDiscountCode }
