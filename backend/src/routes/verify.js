const express = require('express')
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const router = express.Router()
const prisma = new PrismaClient()

router.post('/', async (req, res) => {
  const { schoolId, schoolCode, studentCode } = req.body
  if (!schoolId || !schoolCode || !studentCode) {
    return res.status(400).json({ error: 'schoolId, schoolCode, and studentCode are required' })
  }

  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, accessCode: true, isActive: true },
    })
    if (!school || !school.isActive) return res.status(404).json({ error: 'School not found' })
    if (!school.accessCode) return res.status(403).json({ error: 'This school has no access code configured yet' })
    if (school.accessCode !== schoolCode.trim().toUpperCase()) {
      return res.status(403).json({ error: 'Invalid school code' })
    }

    const sc = await prisma.studentCode.findFirst({
      where: { schoolId, code: studentCode.trim().toUpperCase(), isActive: true },
    })
    if (!sc) return res.status(403).json({ error: 'Invalid student code' })
    if (sc.useCount >= sc.maxUses) {
      return res.status(403).json({ error: `Student code has reached its limit (${sc.maxUses} uses)` })
    }

    const token = jwt.sign(
      { schoolId, studentCodeId: sc.id },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    )

    res.json({ token })
  } catch (e) {
    res.status(500).json({ error: 'Verification failed' })
  }
})

module.exports = router
