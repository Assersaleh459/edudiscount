import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import StepProgress from '../components/StepProgress'
import CascadeSelector from '../components/CascadeSelector'
import PricePreviewCard from '../components/PricePreviewCard'
import LanguageToggle from '../components/LanguageToggle'
import api from '../api/client'

export default function SelectorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selection, setSelection] = useState({ school: null, subject: null, teacher: null })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentStep = selection.teacher ? 3 : selection.subject ? 2 : selection.school ? 1 : 0
  const canSubmit = selection.school && selection.subject && selection.teacher && email && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError(t('errors.invalidEmail'))
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/codes/generate', {
        schoolId: selection.school.id,
        subjectId: selection.subject.id,
        teacherId: selection.teacher.id,
        studentEmail: email,
      })
      navigate(`/code/${data.codeId}`)
    } catch (err) {
      const msg = err.response?.data?.error
      if (err.response?.status === 429) setError(t('errors.rateLimited'))
      else setError(msg || t('errors.generic'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-light flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-white font-bold text-xl">{t('appName')}</span>
        </div>
        <LanguageToggle />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('tagline')}</h1>
          </div>

          <StepProgress currentStep={currentStep + 1} />

          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <CascadeSelector onSelectionChange={setSelection} />

            <AnimatePresence>
              {selection.teacher && (
                <PricePreviewCard teacher={selection.teacher} />
              )}
            </AnimatePresence>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enterEmail')}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none transition"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-4 rounded-xl font-bold text-lg transition
                ${canSubmit ? 'bg-navy text-white hover:bg-navy-light shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {loading ? t('generating') : t('getCode')}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
