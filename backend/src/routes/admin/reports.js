const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    // Codes issued per school per month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const allCodes = await prisma.discountCode.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      include: { teacher: { include: { subject: { include: { school: true } } } } },
    })

    // Group by school + month
    const bySchoolMonth = {}
    for (const c of allCodes) {
      const school = c.teacher.subject.school.name
      const month = c.createdAt.toISOString().slice(0, 7)
      const key = `${school}__${month}`
      bySchoolMonth[key] = (bySchoolMonth[key] || 0) + 1
    }

    // Redemption rate per teacher
    const teachers = await prisma.teacher.findMany({
      include: { codes: true },
    })
    const teacherStats = teachers.map((t) => {
      const total = t.codes.length
      const used = t.codes.filter((c) => c.status === 'USED').length
      const totalSaving = t.codes
        .filter((c) => c.status === 'USED')
        .reduce((sum, c) => sum + (c.originalPrice - c.finalPrice), 0)
      return {
        id: t.id,
        name: t.name,
        totalCodes: total,
        usedCodes: used,
        redemptionRate: total ? Math.round((used / total) * 100) : 0,
        totalDiscountGiven: totalSaving,
        currency: 'EGP',
      }
    })

    // Summary stats
    const totalCodes = await prisma.discountCode.count()
    const usedCodes = await prisma.discountCode.count({ where: { status: 'USED' } })
    const activeSchools = await prisma.school.count({ where: { isActive: true } })
    const totalTeachers = await prisma.teacher.count({ where: { isActive: true } })

    res.json({
      summary: { totalCodes, usedCodes, activeSchools, totalTeachers },
      bySchoolMonth,
      teacherStats,
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
})

module.exports = router
