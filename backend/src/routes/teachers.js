const express = require('express')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const { subjectId } = req.query
  if (!subjectId) return res.status(400).json({ error: 'subjectId is required' })

  try {
    const teachers = await prisma.teacher.findMany({
      where: { subjectId, isActive: true },
      select: {
        id: true,
        name: true,
        nameAr: true,
        photoUrl: true,
        coursePrice: true,
        discountPct: true,
      },
      orderBy: { name: 'asc' },
    })
    res.json(teachers)
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch teachers' })
  }
})

module.exports = router
