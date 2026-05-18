const express = require('express')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()

router.use(requireAuth)

// Settings are stored in .env / environment variables
// This endpoint exposes non-sensitive settings and allows updating them at runtime
let runtimeSettings = {
  partnerApiUrl: process.env.PARTNER_API_URL || '',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'EGP',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: process.env.SMTP_PORT || '587',
  smtpUser: process.env.SMTP_USER || '',
  smtpFrom: process.env.SMTP_FROM || '',
}

router.get('/', (req, res) => {
  res.json(runtimeSettings)
})

router.put('/', (req, res) => {
  const { partnerApiUrl, defaultCurrency, smtpHost, smtpPort, smtpUser, smtpFrom } = req.body
  if (partnerApiUrl !== undefined) runtimeSettings.partnerApiUrl = partnerApiUrl
  if (defaultCurrency !== undefined) runtimeSettings.defaultCurrency = defaultCurrency
  if (smtpHost !== undefined) runtimeSettings.smtpHost = smtpHost
  if (smtpPort !== undefined) runtimeSettings.smtpPort = smtpPort
  if (smtpUser !== undefined) runtimeSettings.smtpUser = smtpUser
  if (smtpFrom !== undefined) runtimeSettings.smtpFrom = smtpFrom
  res.json({ success: true, settings: runtimeSettings })
})

module.exports = router
