const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(requireAuth)

router.get('/', async (req, res) => {
  const schools = await prisma.school.findMany({ orderBy: { name: 'asc' } })
  res.json(schools)
})

router.post('/', async (req, res) => {
  const { name, nameAr, logoUrl, language, platformId } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  try {
    const school = await prisma.school.create({ data: { name, nameAr, logoUrl, language: language || 'Arabic', platformId } })
    res.status(201).json(school)
  } catch (e) {
    res.status(500).json({ error: 'Failed to create school' })
  }
})

router.put('/:id', async (req, res) => {
  const { name, nameAr, logoUrl, language, platformId, isActive } = req.body
  try {
    const school = await prisma.school.update({
      where: { id: req.params.id },
      data: { name, nameAr, logoUrl, language, platformId, isActive },
    })
    res.json(school)
  } catch (e) {
    res.status(500).json({ error: 'Failed to update school' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.school.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete school' })
  }
})

module.exports = router
