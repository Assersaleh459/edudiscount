import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CodeCard from '../components/CodeCard'
import LanguageToggle from '../components/LanguageToggle'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'

export default function CodePage() {
  const { codeId } = useParams()
  const { t } = useTranslation()
  const theme = useTheme()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/codes/${codeId}`)
      .then((r) => setData(r.data))
      .catch((err) => {
        if (err.response?.status === 404) setError('Code not found')
        else setError(err.response?.data?.error || t('errors.generic'))
      })
      .finally(() => setLoading(false))
  }, [codeId])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--code-bg, #1B2A4A)' }}>
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{theme.welcomeIcon || '🎓'}</span>
          <span className="text-white font-bold text-xl">{t('appName')}</span>
        </div>
        <LanguageToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {loading && (
          <div className="text-white text-lg animate-pulse">{t('loading')}</div>
        )}

        {!loading && error && (
          <div className="text-center">
            <p className="text-white text-xl mb-4">⚠️ {error}</p>
            <Link
              to="/"
              className="text-white font-semibold px-6 py-3 rounded-xl transition"
              style={{ backgroundColor: 'var(--accent, #00B8A9)' }}
            >
              {t('generateNew')}
            </Link>
          </div>
        )}

        {!loading && data && (
          <div className="w-full max-w-sm">
            {(data.status === 'USED' || data.status === 'EXPIRED') ? (
              <div className="text-center">
                <p className="text-white text-xl mb-2">
                  {data.status === 'USED' ? t('codeUsed') : t('codeExpired')}
                </p>
                <p className="text-white/60 mb-6">Code: {data.code}</p>
                <Link
                  to="/"
                  className="text-white font-semibold px-6 py-3 rounded-xl transition"
                  style={{ backgroundColor: 'var(--accent, #00B8A9)' }}
                >
                  {t('generateNew')}
                </Link>
              </div>
            ) : (
              <>
                <CodeCard data={data} />
                <p className="text-white/60 text-xs text-center mt-4">{t('emailConfirmation')}</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
