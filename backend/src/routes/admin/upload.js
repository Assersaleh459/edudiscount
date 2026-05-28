const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()
router.use(requireAuth)

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

let cloudinary
if (useCloudinary) {
  cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const ALLOWED_EXTS  = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (ALLOWED_EXTS.includes(ext)) cb(null, true)
  else cb(new Error('Only image files are allowed'))
}

// Use memory storage when Cloudinary is enabled; disk otherwise
let upload
if (useCloudinary) {
  upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })
} else {
  const UPLOADS_DIR = path.join(__dirname, '../../../uploads')
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, `logo-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
  })
  upload = multer({ storage: diskStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })
}

router.post('/', upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  try {
    if (useCloudinary) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'edudiscount', resource_type: 'image' },
          (err, result) => err ? reject(err) : resolve(result)
        )
        stream.end(req.file.buffer)
      })
      res.json({ url: result.secure_url })
    } else {
      res.json({ url: `/api/uploads/${req.file.filename}` })
    }
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

module.exports = router
