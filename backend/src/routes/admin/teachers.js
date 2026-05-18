const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(requireAuth)

router.get('/', async (req, res) => {
  const { subjectId } = req.query
  const where = subjectId ? { subjectId } : {}
  const teachers = await prisma.teacher.findMany({
    where,
    include: { subject: { select: { name: true, school: { select: { name: true } } } } },
    orderBy: { name: 'asc' },
  })
  res.json(teachers)
})

router.post('/', async (req, res) => {
  const { subjectId, name, nameAr, photoUrl, platformTeacherId, coursePrice, discountPct } = req.body
  if (!subjectId || !name || coursePrice == null || discountPct == null) {
    return res.status(400).json({ error: 'subjectId, name, coursePrice, and discountPct are required' })
  }
  try {
    const teacher = await prisma.teacher.create({
      data: { subjectId, name, nameAr, photoUrl, platformTeacherId: platformTeacherId || '', coursePrice: Number(coursePrice), discountPct: Number(discountPct) },
    })
    res.status(201).json(teacher)
  } catch (e) {
    res.status(500).json({ error: 'Failed to create teacher' })
  }
})

router.put('/:id', async (req, res) => {
  const { name, nameAr, photoUrl, platformTeacherId, coursePrice, discountPct, isActive } = req.body
  try {
    const data = { name, nameAr, photoUrl, platformTeacherId, isActive }
    if (coursePrice != null) data.coursePrice = Number(coursePrice)
    if (discountPct != null) data.discountPct = Number(discountPct)
    const teacher = await prisma.teacher.update({ where: { id: req.params.id }, data })
    res.json(teacher)
  } catch (e) {
    res.status(500).json({ error: 'Failed to update teacher' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.teacher.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete teacher' })
  }
})

module.exports = router
