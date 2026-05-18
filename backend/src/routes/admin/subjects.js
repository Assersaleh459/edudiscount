const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(requireAuth)

router.get('/', async (req, res) => {
  const { schoolId } = req.query
  const where = schoolId ? { schoolId } : {}
  const subjects = await prisma.subject.findMany({ where, include: { school: { select: { name: true } } }, orderBy: { name: 'asc' } })
  res.json(subjects)
})

router.post('/', async (req, res) => {
  const { schoolId, name, nameAr } = req.body
  if (!schoolId || !name) return res.status(400).json({ error: 'schoolId and name are required' })
  try {
    const subject = await prisma.subject.create({ data: { schoolId, name, nameAr } })
    res.status(201).json(subject)
  } catch (e) {
    res.status(500).json({ error: 'Failed to create subject' })
  }
})

router.put('/:id', async (req, res) => {
  const { name, nameAr, isActive } = req.body
  try {
    const subject = await prisma.subject.update({ where: { id: req.params.id }, data: { name, nameAr, isActive } })
    res.json(subject)
  } catch (e) {
    res.status(500).json({ error: 'Failed to update subject' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete subject' })
  }
})

module.exports = router
