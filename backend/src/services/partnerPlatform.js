const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')
const fetch = require('node-fetch')

const prisma = new PrismaClient()

function sign(payload) {
  return crypto
    .createHmac('sha256', process.env.PARTNER_WEBHOOK_SECRET || '')
    .update(JSON.stringify(payload))
    .digest('hex')
}

async function registerCode(payload, attempt = 1) {
  const url = process.env.PARTNER_API_URL
  const signature = sign(payload)

  let response, responseText
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PARTNER_API_KEY}`,
        'X-Signature': signature,
      },
      body: JSON.stringify(payload),
    })
    responseText = await response.text()
  } catch (e) {
    responseText = e.message
  }

  await prisma.integrationLog.create({
    data: {
      direction: 'OUTBOUND',
      endpoint: url,
      payload: JSON.stringify(payload),
      response: responseText,
      status: response ? response.status : null,
    },
  })

  if (!response || !response.ok) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
      return registerCode(payload, attempt + 1)
    }
    console.error(`[Partner] registerCode failed after 3 attempts`)
  }
}

async function verifyTeacher(platformTeacherId) {
  const url = `${process.env.PARTNER_API_URL}/teachers/${platformTeacherId}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.PARTNER_API_KEY}` },
    })
    return res.ok
  } catch {
    return false
  }
}

module.exports = { registerCode, verifyTeacher }
