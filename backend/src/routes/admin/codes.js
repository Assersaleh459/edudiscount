const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(requireAuth)

router.get('/', async (req, res) => {
  const { status, email, export: exportCsv } = req.query

  const where = {}
  if (status && status !== 'ALL') where.status = status
  if (email) where.studentEmail = { contains: email, mode: 'insensitive' }

  const codes = await prisma.discountCode.findMany({
    where,
    include: {
      teacher: { select: { name: true, discountPct: true, subject: { select: { name: true, school: { select: { name: true } } } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (exportCsv === 'csv') {
    const rows = [
      ['Code', 'Student Email', 'Teacher', 'School', 'Subject', 'Discount%', 'Original Price', 'Final Price', 'Currency', 'Status', 'Created', 'Expires', 'Used At'],
      ...codes.map((c) => [
        c.code, c.studentEmail, c.teacher.name,
        c.teacher.subject.school.name, c.teacher.subject.name,
        c.discountPct, c.originalPrice / 100, c.finalPrice / 100, c.currency,
        c.status, c.createdAt, c.expiresAt, c.usedAt || '',
      ]),
    ]
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="codes.csv"')
    return res.send(rows.map((r) => r.join(',')).join('\n'))
  }

  res.json(codes)
})

module.exports = router
