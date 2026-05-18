import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

function fmt(piastres, currency) {
  return `${(piastres / 100).toFixed(0)} ${currency}`
}

export default function PricePreviewCard({ teacher, currency = 'EGP' }) {
  if (!teacher) return null

  const original = teacher.coursePrice
  const saving = Math.round(original * teacher.discountPct / 100)
  const final = original - saving

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-xl border-2 border-teal/30 bg-teal/5 p-4"
    >
      <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
        <span className="line-through">{fmt(original, currency)}</span>
        <span className="bg-teal text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {teacher.discountPct}% OFF
        </span>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-gray-400">You save {fmt(saving, currency)}</p>
          <p className="text-2xl font-bold text-navy">{fmt(final, currency)}</p>
        </div>
      </div>
    </motion.div>
  )
}
