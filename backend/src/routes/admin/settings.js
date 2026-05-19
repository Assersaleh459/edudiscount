const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(requireAuth)

const DEFAULTS = {
  logoUrl: process.env.LOGO_URL || '',
  welcomeIcon: process.env.WELCOME_ICON || '🎓',
  welcomeTitle: process.env.WELCOME_TITLE || 'EduDiscount',
  welcomeTitleAr: process.env.WELCOME_TITLE_AR || 'EduDiscount',
  welcomeSubtitle: process.env.WELCOME_SUBTITLE || 'Get your student discount in seconds',
  welcomeSubtitleAr: process.env.WELCOME_SUBTITLE_AR || 'احصل على خصمك الطلابي في ثوانٍ',
  primaryColor: process.env.PRIMARY_COLOR || '#1B2A4A',
  accentColor: process.env.ACCENT_COLOR || '#00B8A9',
  welcomePageBg: process.env.WELCOME_PAGE_BG || '#1B2A4A',
  selectorPageBg: process.env.SELECTOR_PAGE_BG || '#1B2A4A',
  codePageBg: process.env.CODE_PAGE_BG || '#1B2A4A',
  partnerApiUrl: process.env.PARTNER_API_URL || '',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'EGP',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: process.env.SMTP_PORT || '587',
  smtpUser: process.env.SMTP_USER || '',
  smtpFrom: process.env.SMTP_FROM || '',
}

// In-memory cache — loaded from DB on startup
let runtimeSettings = { ...DEFAULTS }

async function loadFromDb() {
  try {
    const rows = await prisma.setting.findMany()
    for (const { key, value } of rows) {
      if (key in DEFAULTS) runtimeSettings[key] = value
    }
  } catch (e) {
    console.error('Could not load settings from DB:', e.message)
  }
}

loadFromDb()

router.get('/', (req, res) => {
  res.json(runtimeSettings)
})

router.put('/', async (req, res) => {
  const allowed = Object.keys(DEFAULTS)
  const updates = []
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      runtimeSettings[key] = req.body[key]
      updates.push(
        prisma.setting.upsert({
          where: { key },
          update: { value: req.body[key] },
          create: { key, value: req.body[key] },
        })
      )
    }
  }
  await Promise.all(updates)
  res.json({ success: true, settings: runtimeSettings })
})

module.exports = { router, runtimeSettings }
