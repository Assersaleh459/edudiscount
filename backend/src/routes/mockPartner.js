const express = require('express')
const router = express.Router()

router.post('/receive', (req, res) => {
  console.log('[MockPartner] Received discount registration:')
  console.log(JSON.stringify(req.body, null, 2))
  res.json({ success: true, message: 'Mock partner received the code.' })
})

module.exports = router
