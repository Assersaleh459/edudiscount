require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const schoolsRouter = require('./routes/schools')
const subjectsRouter = require('./routes/subjects')
const teachersRouter = require('./routes/teachers')
const codesRouter = require('./routes/codes')
const webhooksRouter = require('./routes/webhooks')
const mockPartnerRouter = require('./routes/mockPartner')
const adminAuthRouter = require('./routes/admin/auth')
const adminSchoolsRouter = require('./routes/admin/schools')
const adminSubjectsRouter = require('./routes/admin/subjects')
const adminTeachersRouter = require('./routes/admin/teachers')
const adminCodesRouter = require('./routes/admin/codes')
const adminReportsRouter = require('./routes/admin/reports')
const { router: adminSettingsRouter, runtimeSettings } = require('./routes/admin/settings')
const adminUploadRouter = require('./routes/admin/upload')
const adminAccessCodesRouter = require('./routes/admin/accessCodes')
const verifyRouter = require('./routes/verify')

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json())

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, '../../uploads')))

// Public routes
app.use('/api/verify', verifyRouter)
app.use('/api/schools', schoolsRouter)
app.use('/api/subjects', subjectsRouter)
app.use('/api/teachers', teachersRouter)
app.use('/api/codes', codesRouter)
app.use('/api/webhooks', webhooksRouter)
app.use('/api/mock-partner', mockPartnerRouter)

// Admin routes
app.use('/api/admin/auth', adminAuthRouter)
app.use('/api/admin/schools', adminSchoolsRouter)
app.use('/api/admin/subjects', adminSubjectsRouter)
app.use('/api/admin/teachers', adminTeachersRouter)
app.use('/api/admin/codes', adminCodesRouter)
app.use('/api/admin/reports', adminReportsRouter)
app.use('/api/admin/settings', adminSettingsRouter)
app.use('/api/admin/upload', adminUploadRouter)
app.use('/api/admin/access-codes', adminAccessCodesRouter)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.get('/api/public/settings', (req, res) => {
  res.json({
    logoUrl: runtimeSettings.logoUrl,
    welcomeIcon: runtimeSettings.welcomeIcon,
    welcomeTitle: runtimeSettings.welcomeTitle,
    welcomeTitleAr: runtimeSettings.welcomeTitleAr,
    welcomeSubtitle: runtimeSettings.welcomeSubtitle,
    welcomeSubtitleAr: runtimeSettings.welcomeSubtitleAr,
    primaryColor: runtimeSettings.primaryColor,
    accentColor: runtimeSettings.accentColor,
    welcomePageBg: runtimeSettings.welcomePageBg,
    selectorPageBg: runtimeSettings.selectorPageBg,
    codePageBg: runtimeSettings.codePageBg,
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
