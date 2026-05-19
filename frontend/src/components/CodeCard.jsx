import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

function fmt(piastres, currency) {
  return `${(piastres / 100).toFixed(0)} ${currency}`
}

export default function CodeCard({ data }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(data.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saving = data.originalPrice - data.finalPrice

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-2xl p-6 text-white shadow-2xl max-w-sm w-full mx-auto"
      style={{ backgroundColor: 'var(--primary, #1B2A4A)' }}
    >
      {/* Header */}
      <div className="mb-4">
        <p className="text-white/60 text-sm">🎓 {data.schoolName}</p>
        <p className="text-white/80 text-sm">{data.subjectName} • {data.teacherName}</p>
      </div>

      {/* Discount badge */}
      <div className="flex justify-center my-4">
        <div
          className="w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg"
          style={{ backgroundColor: 'var(--accent, #00B8A9)' }}
        >
          <span className="text-3xl font-bold">{data.discountPct}%</span>
          <span className="text-sm font-medium">{t('off')}</span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="flex justify-between items-center text-sm mb-4 px-2">
        <div className="text-center">
          <p className="text-white/50 text-xs">{t('originalPrice')}</p>
          <p className="line-through text-white/50">{fmt(data.originalPrice, data.currency)}</p>
        </div>
        <span className="text-white/40 text-lg">→</span>
        <div className="text-center">
          <p className="text-white/50 text-xs">{t('youPay')}</p>
          <p className="font-bold text-xl" style={{ color: 'var(--accent, #00B8A9)' }}>
            {fmt(data.finalPrice, data.currency)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-white/50 text-xs">{t('youSave')}</p>
          <p className="text-green-400 font-semibold">{fmt(saving, data.currency)}</p>
        </div>
      </div>

      {/* Code box */}
      <div
        onClick={copyCode}
        className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/20 transition mb-3"
      >
        <span className="font-mono font-bold text-lg tracking-widest">{data.code}</span>
        <span className="text-sm" style={{ color: 'var(--accent, #00B8A9)' }}>
          {copied ? t('copied') : t('copyCode')}
        </span>
      </div>

      <p className="text-white/40 text-xs text-center mb-4">{t('validFor')}</p>

      {/* CTA */}
      <a
        href={`https://partner-platform.com?code=${data.code}&teacher=${data.platformTeacherId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center text-white font-semibold py-3 rounded-xl transition hover:opacity-90"
        style={{ backgroundColor: 'var(--accent, #00B8A9)' }}
      >
        {t('useOnPlatform')}
      </a>
    </motion.div>
  )
}
