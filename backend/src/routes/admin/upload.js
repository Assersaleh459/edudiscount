const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()
router.use(requireAuth)

const UPLOADS_DIR = path.join(__dirname, '../../../../uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `logo-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

router.post('/', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: `/api/uploads/${req.file.filename}` })
})

module.exports = router
