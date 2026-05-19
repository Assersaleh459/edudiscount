const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(requireAuth)

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I confusion

function randomCode(prefix) {
  let code = ''
  for (let i = 0; i < 8; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)]
  return `${prefix}-${code}`
}

// GET /api/admin/access-codes/schools
router.get('/schools', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      select: { id: true, name: true, nameAr: true, accessCode: true },
      orderBy: { name: 'asc' },
    })
    res.json(schools)
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch schools' })
  }
})

// POST /api/admin/access-codes/schools/:schoolId/generate
router.post('/schools/:schoolId/generate', async (req, res) => {
  try {
    const code = randomCode('SCH')
    const school = await prisma.school.update({
      where: { id: req.params.schoolId },
      data: { accessCode: code },
      select: { id: true, name: true, nameAr: true, accessCode: true },
    })
    res.json(school)
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate school code' })
  }
})

// GET /api/admin/access-codes/students?schoolId=:id
router.get('/students', async (req, res) => {
  const { schoolId } = req.query
  if (!schoolId) return res.status(400).json({ error: 'schoolId required' })
  try {
    const codes = await prisma.studentCode.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(codes)
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch student codes' })
  }
})

// GET /api/admin/access-codes/students/export?schoolId=:id  (must be before /:id routes)
router.get('/students/export', async (req, res) => {
  const { schoolId } = req.query
  if (!schoolId) return res.status(400).json({ error: 'schoolId required' })
  try {
    const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } })
    const codes = await prisma.studentCode.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } })
    const rows = ['Code,Label,Max Uses,Use Count,Active,Created']
    for (const c of codes) {
      rows.push(`${c.code},"${c.label || ''}",${c.maxUses},${c.useCount},${c.isActive},${c.createdAt.toISOString()}`)
    }
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${school?.name || 'school'}-student-codes.csv"`)
    res.send(rows.join('\n'))
  } catch (e) {
    res.status(500).json({ error: 'Export failed' })
  }
})

// POST /api/admin/access-codes/students/generate
router.post('/students/generate', async (req, res) => {
  const { schoolId, count = 1, labelPrefix = '', maxUses = 10 } = req.body
  if (!schoolId) return res.status(400).json({ error: 'schoolId required' })
  const n = Math.min(Math.max(1, Number(count)), 500)
  try {
    const created = []
    for (let i = 0; i < n; i++) {
      let code, exists = true, attempts = 0
      while (exists && attempts < 10) {
        code = randomCode('STU')
        exists = await prisma.studentCode.findUnique({ where: { code } })
        attempts++
      }
      const label = labelPrefix ? `${labelPrefix}-${String(i + 1).padStart(3, '0')}` : ''
      created.push(
        await prisma.studentCode.create({
          data: { schoolId, code, label, maxUses: Number(maxUses) },
        })
      )
    }
    res.json({ count: created.length, codes: created })
  } catch (e) {
    res.status(500).json({ error: 'Bulk generation failed' })
  }
})

// PUT /api/admin/access-codes/students/:id
router.put('/students/:id', async (req, res) => {
  const { label, maxUses, isActive } = req.body
  const data = {}
  if (label !== undefined) data.label = label
  if (maxUses !== undefined) data.maxUses = Number(maxUses)
  if (isActive !== undefined) data.isActive = Boolean(isActive)
  try {
    const updated = await prisma.studentCode.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) {
    res.status(500).json({ error: 'Update failed' })
  }
})

// DELETE /api/admin/access-codes/students/:id
router.delete('/students/:id', async (req, res) => {
  try {
    await prisma.studentCode.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Delete failed' })
  }
})

module.exports = router
