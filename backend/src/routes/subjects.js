const express = require('express')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const { schoolId } = req.query
  if (!schoolId) return res.status(400).json({ error: 'schoolId is required' })

  try {
    const subjects = await prisma.subject.findMany({
      where: { schoolId, isActive: true },
      select: { id: true, name: true, nameAr: true },
      orderBy: { name: 'asc' },
    })
    res.json(subjects)
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch subjects' })
  }
})

module.exports = router
