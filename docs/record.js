const { chromium } = require('playwright')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const path = require('path')
const fs = require('fs')

ffmpeg.setFfmpegPath(ffmpegPath)

const HTML_FILE = path.resolve(__dirname, 'demo-video.html')
const WEBM_OUT  = path.resolve(__dirname, 'EduDiscount-Demo.webm')
const MP4_OUT   = path.resolve(__dirname, 'EduDiscount-Demo.mp4')
const VIDEO_DIR = path.resolve(__dirname, 'video-tmp')

// Total demo duration in ms (sum of all scene durations + buffer)
// Scenes: 6+7+7+8+8+7+7+8+7+9+8 = 82s + 5s buffer
const DEMO_DURATION_MS = 87000

;(async () => {
  console.log('🎬 Starting demo recording...')

  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR)

  const browser = await chromium.launch({ headless: true })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1920, height: 1080 },
    },
  })

  const page = await context.newPage()

  console.log('📄 Loading demo page...')
  await page.goto('file:///' + HTML_FILE.replace(/\\/g, '/'))

  console.log(`⏳ Recording for ${DEMO_DURATION_MS / 1000}s...`)
  await page.waitForTimeout(DEMO_DURATION_MS)

  console.log('🛑 Stopping recording...')
  const videoPath = await page.video().path()
  await context.close()
  await browser.close()

  // Move webm to output location
  fs.copyFileSync(videoPath, WEBM_OUT)
  console.log('✅ WebM saved:', WEBM_OUT)

  // Convert to MP4
  console.log('🔄 Converting to MP4...')
  await new Promise((resolve, reject) => {
    ffmpeg(WEBM_OUT)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-crf 18',
        '-preset fast',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
      ])
      .output(MP4_OUT)
      .on('progress', p => process.stdout.write(`\r  Progress: ${Math.round(p.percent || 0)}%`))
      .on('end', () => { console.log('\n✅ MP4 saved:', MP4_OUT); resolve() })
      .on('error', reject)
      .run()
  })

  // Cleanup
  fs.unlinkSync(WEBM_OUT)
  fs.rmSync(VIDEO_DIR, { recursive: true, force: true })

  const size = (fs.statSync(MP4_OUT).size / 1024 / 1024).toFixed(1)
  console.log(`\n🎉 Done! EduDiscount-Demo.mp4 (${size} MB)`)
})()
