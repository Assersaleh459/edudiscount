const express = require('express')
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const { generateDiscountCode } = require('../services/codeGenerator')
const { codeGenerationLimiter } = require('../middleware/rateLimiter')

const router = express.Router()
const prisma = new PrismaClient()

// Generate a new discount code
router.post('/generate', codeGenerationLimiter, async (req, res) => {
  const { schoolId, subjectId, teacherId, studentEmail, verificationToken } = req.body
  if (!schoolId || !subjectId || !teacherId || !studentEmail) {
    return res.status(400).json({ error: 'schoolId, subjectId, teacherId, and studentEmail are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  // Verify student access token
  if (!verificationToken) {
    return res.status(401).json({ error: 'Access verification required. Please verify your school and student codes.' })
  }
  let tokenPayload
  try {
    tokenPayload = jwt.verify(verificationToken, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'Verification expired or invalid. Please verify again.' })
  }
  if (tokenPayload.schoolId !== schoolId) {
    return res.status(403).json({ error: 'Verification mismatch. Please verify again.' })
  }

  // Check student code is still within limits
  const sc = await prisma.studentCode.findUnique({ where: { id: tokenPayload.studentCodeId } })
  if (!sc || !sc.isActive) return res.status(403).json({ error: 'Student code is no longer active.' })
  if (sc.useCount >= sc.maxUses) return res.status(403).json({ error: `Student code limit reached (${sc.maxUses} uses).` })

  try {
    await prisma.studentCode.update({ where: { id: sc.id }, data: { useCount: { increment: 1 } } })
    const result = await generateDiscountCode({ schoolId, subjectId, teacherId, studentEmail })
    res.status(201).json(result)
  } catch (e) {
    // Roll back use count increment on failure
    await prisma.studentCode.update({ where: { id: sc.id }, data: { useCount: { decrement: 1 } } }).catch(() => {})
    res.status(e.status || 500).json({ error: e.message })
  }
})

// Get code details by ID
router.get('/:codeId', async (req, res) => {
  try {
    const record = await prisma.discountCode.findUnique({
      where: { id: req.params.codeId },
      include: {
        teacher: {
          include: { subject: { include: { school: true } } },
        },
      },
    })
    if (!record) return res.status(404).json({ error: 'Code not found' })

    // Auto-expire if past expiresAt
    if (record.status === 'ACTIVE' && new Date() > record.expiresAt) {
      await prisma.discountCode.update({ where: { id: record.id }, data: { status: 'EXPIRED' } })
      record.status = 'EXPIRED'
    }

    res.json({
      id: record.id,
      code: record.code,
      status: record.status,
      discountPct: record.discountPct,
      originalPrice: record.originalPrice,
      finalPrice: record.finalPrice,
      currency: record.currency,
      expiresAt: record.expiresAt,
      usedAt: record.usedAt,
      teacherName: record.teacher.name,
      teacherNameAr: record.teacher.nameAr,
      subjectName: record.teacher.subject.name,
      subjectNameAr: record.teacher.subject.nameAr,
      schoolName: record.teacher.subject.school.name,
      schoolNameAr: record.teacher.subject.school.nameAr,
      platformTeacherId: record.teacher.platformTeacherId,
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch code' })
  }
})

// Mark code as used
router.post('/:codeId/redeem', async (req, res) => {
  try {
    const record = await prisma.discountCode.findUnique({ where: { id: req.params.codeId } })
    if (!record) return res.status(404).json({ error: 'Code not found' })
    if (record.status !== 'ACTIVE') return res.status(409).json({ error: `Code is already ${record.status}` })

    const updated = await prisma.discountCode.update({
      where: { id: record.id },
      data: { status: 'USED', usedAt: new Date() },
    })
    res.json({ success: true, usedAt: updated.usedAt })
  } catch (e) {
    res.status(500).json({ error: 'Redemption failed' })
  }
})

// Resend existing active code to email
router.post('/resend', async (req, res) => {
  const { studentEmail, teacherId } = req.body
  if (!studentEmail || !teacherId) return res.status(400).json({ error: 'studentEmail and teacherId are required' })

  try {
    const record = await prisma.discountCode.findFirst({
      where: { studentEmail, teacherId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      include: { teacher: { include: { subject: { include: { school: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
    if (!record) return res.status(404).json({ error: 'No active code found for this email and teacher' })

    const emailService = require('../services/emailService')
    await emailService.sendCodeEmail({
      to: studentEmail,
      code: record.code,
      teacherName: record.teacher.name,
      schoolName: record.teacher.subject.school.name,
      subjectName: record.teacher.subject.name,
      discountPct: record.discountPct,
      originalPrice: record.originalPrice,
      finalPrice: record.finalPrice,
      currency: record.currency,
      expiresAt: record.expiresAt,
    })

    res.json({ success: true, message: 'Code resent to your email' })
  } catch (e) {
    res.status(500).json({ error: 'Failed to resend code' })
  }
})

module.exports = router
