import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import LanguageToggle from '../components/LanguageToggle'
import { useTheme } from '../context/ThemeContext'

export default function WelcomePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isAr = i18n.language === 'ar'

  const title = isAr
    ? (theme.welcomeTitleAr || theme.welcomeTitle || t('appName'))
    : (theme.welcomeTitle || t('appName'))

  const subtitle = isAr
    ? (theme.welcomeSubtitleAr || theme.welcomeSubtitle || t('tagline'))
    : (theme.welcomeSubtitle || t('tagline'))

  const icon = theme.welcomeIcon || '🎓'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--welcome-bg, #1B2A4A)' }}>
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
          {/* Logo / Icon */}
          <div className="flex items-center justify-center">
            {theme.logoUrl ? (
              <>
                <img
                  src={theme.logoUrl}
                  alt="Logo"
                  className="w-40 h-40 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <span className="text-8xl" style={{ display: 'none' }}>{icon}</span>
              </>
            ) : (
              <span className="text-8xl">{icon}</span>
            )}
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
            className="mt-4 px-10 py-4 bg-white font-bold text-lg rounded-2xl shadow-xl hover:bg-white/90 transition"
            style={{ color: 'var(--welcome-bg, #1B2A4A)' }}
          >
            {t('getStarted')} →
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}
