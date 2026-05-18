const express = require('express')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()

router.use(requireAuth)

// Settings are stored in .env / environment variables
// This endpoint exposes non-sensitive settings and allows updating them at runtime
let runtimeSettings = {
  logoUrl: process.env.LOGO_URL || '',
  welcomeTitle: process.env.WELCOME_TITLE || 'EduDiscount',
  welcomeTitleAr: process.env.WELCOME_TITLE_AR || 'EduDiscount',
  welcomeSubtitle: process.env.WELCOME_SUBTITLE || 'Get your student discount in seconds',
  welcomeSubtitleAr: process.env.WELCOME_SUBTITLE_AR || 'احصل على خصمك الطلابي في ثوانٍ',
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
  const allowed = ['logoUrl','welcomeTitle','welcomeTitleAr','welcomeSubtitle','welcomeSubtitleAr',
    'partnerApiUrl','defaultCurrency','smtpHost','smtpPort','smtpUser','smtpFrom']
  for (const key of allowed) {
    if (req.body[key] !== undefined) runtimeSettings[key] = req.body[key]
  }
  res.json({ success: true, settings: runtimeSettings })
})

module.exports = { router, runtimeSettings }
