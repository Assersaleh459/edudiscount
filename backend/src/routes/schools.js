const express = require('express')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      where: { isActive: true },
      select: { id: true, name: true, nameAr: true, logoUrl: true, language: true, accessCode: true },
      orderBy: { name: 'asc' },
    })
    res.json(schools.map(s => ({ ...s, hasAccessCode: !!s.accessCode, accessCode: undefined })))
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch schools' })
  }
})

module.exports = router
