const express = require('express')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

router.post('/partner-redemption', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-signature']
  const expectedSig = crypto
    .createHmac('sha256', process.env.PARTNER_WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex')

  if (signature !== expectedSig) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  let payload
  try {
    payload = JSON.parse(req.body)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const { code } = payload
  if (!code) return res.status(400).json({ error: 'code is required' })

  try {
    const existing = await prisma.discountCode.findUnique({ where: { code } })
    if (!existing) return res.status(404).json({ error: 'Code not found' })
    if (existing.status !== 'ACTIVE') return res.status(409).json({ error: `Code is ${existing.status}` })

    await prisma.discountCode.update({
      where: { code },
      data: { status: 'USED', usedAt: new Date() },
    })

    await prisma.integrationLog.create({
      data: {
        direction: 'INBOUND',
        endpoint: '/api/webhooks/partner-redemption',
        payload: JSON.stringify(payload),
        response: JSON.stringify({ success: true }),
        status: 200,
      },
    })

    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Redemption failed' })
  }
})

module.exports = router
