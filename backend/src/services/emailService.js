const nodemailer = require('nodemailer')

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function formatPrice(piastres, currency) {
  return `${(piastres / 100).toFixed(0)} ${currency}`
}

async function sendCodeEmail({ to, code, teacherName, schoolName, subjectName, discountPct, originalPrice, finalPrice, currency, expiresAt }) {
  const transporter = getTransporter()
  const saving = originalPrice - finalPrice

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'EduDiscount <noreply@edudiscount.com>',
    to,
    subject: `Your ${discountPct}% Discount Code — ${teacherName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2 style="color:#1A2A5E">Your Discount Code</h2>
        <p><strong>School:</strong> ${schoolName}</p>
        <p><strong>Subject:</strong> ${subjectName}</p>
        <p><strong>Teacher:</strong> ${teacherName}</p>
        <hr/>
        <p>Original price: <s>${formatPrice(originalPrice, currency)}</s></p>
        <p>Discount: <strong>${discountPct}% OFF</strong> (you save ${formatPrice(saving, currency)})</p>
        <p style="font-size:20px">You pay: <strong style="color:#0D9488">${formatPrice(finalPrice, currency)}</strong></p>
        <hr/>
        <p style="font-size:24px;letter-spacing:4px;font-family:monospace;background:#f4f4f4;padding:12px;text-align:center">
          <strong>${code}</strong>
        </p>
        <p style="color:#666;font-size:13px">Valid for 48 hours · Single use only · Expires ${new Date(expiresAt).toUTCString()}</p>
      </div>
    `,
  })
}

module.exports = { sendCodeEmail }
