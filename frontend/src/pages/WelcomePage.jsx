import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import LanguageToggle from '../components/LanguageToggle'
import api from '../api/client'

export default function WelcomePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAr = i18n.language === 'ar'
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    api.get('/public/settings')
      .then((r) => setSettings(r.data))
      .catch(() => setSettings({}))
  }, [])

  const title = isAr
    ? (settings?.welcomeTitleAr || settings?.welcomeTitle || t('appName'))
    : (settings?.welcomeTitle || t('appName'))

  const subtitle = isAr
    ? (settings?.welcomeSubtitleAr || settings?.welcomeSubtitle || t('tagline'))
    : (settings?.welcomeSubtitle || t('tagline'))

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-light flex flex-col">
      <header className="flex items-center justify-end px-6 py-4">
        <LanguageToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-8"
        >
          {/* Logo */}
          <div className="w-36 h-36 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center shadow-2xl overflow-hidden">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-full h-full object-contain p-3"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
            ) : null}
            <span
              className="text-7xl"
              style={{ display: settings?.logoUrl ? 'none' : 'flex' }}
            >
              🎓
            </span>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white">{title}</h1>
            <p className="text-white/70 text-lg max-w-sm">{subtitle}</p>
          </div>

          {/* CTA */}
          <motion.button
            onClick={() => navigate('/select')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 px-10 py-4 bg-white text-navy font-bold text-lg rounded-2xl shadow-xl hover:bg-white/90 transition"
          >
            {t('getStarted')} →
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}
