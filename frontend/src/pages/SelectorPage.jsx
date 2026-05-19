import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import StepProgress from '../components/StepProgress'
import CascadeSelector from '../components/CascadeSelector'
import PricePreviewCard from '../components/PricePreviewCard'
import LanguageToggle from '../components/LanguageToggle'
import PageIcon from '../components/PageIcon'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'

export default function SelectorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()

  const [selection, setSelection] = useState({ school: null, subject: null, teacher: null })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Verification state
  const [currentSchool, setCurrentSchool] = useState(null)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationToken, setVerificationToken] = useState(null)
  const [schoolCode, setSchoolCode] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  function handleSchoolChange(school) {
    // Reset verification when school changes
    setIsVerified(false)
    setVerificationToken(null)
    setSchoolCode('')
    setStudentCode('')
    setVerifyError('')
    setCurrentSchool(school)
  }

  async function handleVerify() {
    setVerifyError('')
    setVerifying(true)
    try {
      const { data } = await api.post('/verify', {
        schoolId: currentSchool.id,
        schoolCode,
        studentCode,
      })
      setVerificationToken(data.token)
      setIsVerified(true)
    } catch (err) {
      setVerifyError(err.response?.data?.error || 'Verification failed. Please check your codes.')
    } finally {
      setVerifying(false)
    }
  }

  const needsVerification = currentSchool?.hasAccessCode && !isVerified
  const currentStep = selection.teacher ? 3 : selection.subject ? 2 : selection.school ? 1 : 0
  const canSubmit = selection.school && selection.subject && selection.teacher && email && !loading && isVerified

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
        verificationToken,
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--selector-bg, #1B2A4A)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <PageIcon size="sm" />
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
            <CascadeSelector
              onSelectionChange={setSelection}
              onSchoolChange={handleSchoolChange}
              isVerified={!currentSchool?.hasAccessCode || isVerified}
            />

            {/* Verification panel — shown after school selected if it requires codes */}
            <AnimatePresence>
              {currentSchool?.hasAccessCode && !isVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-2 border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-amber-800">🔒 Verify Your Student Access</p>
                    <p className="text-xs text-amber-600">Enter the school code and your personal student code to continue.</p>
                    <input
                      value={schoolCode}
                      onChange={e => setSchoolCode(e.target.value.toUpperCase())}
                      placeholder="School Code (e.g. SCH-ABCD1234)"
                      className="w-full border-2 border-amber-200 rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:outline-none font-mono bg-white"
                    />
                    <input
                      value={studentCode}
                      onChange={e => setStudentCode(e.target.value.toUpperCase())}
                      placeholder="Student Code (e.g. STU-ABCD1234)"
                      className="w-full border-2 border-amber-200 rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:outline-none font-mono bg-white"
                    />
                    {verifyError && <p className="text-red-500 text-xs">{verifyError}</p>}
                    <button
                      onClick={handleVerify}
                      disabled={verifying || !schoolCode || !studentCode}
                      className="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition"
                    >
                      {verifying ? 'Verifying...' : 'Verify Access'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verified badge */}
            <AnimatePresence>
              {isVerified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2"
                >
                  <span className="text-sm">✓</span>
                  <span className="text-sm font-medium">Student access verified</span>
                </motion.div>
              )}
            </AnimatePresence>

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
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none transition"
              onFocus={e => e.target.style.borderColor = 'var(--accent, #00B8A9)'}
              onBlur={e => e.target.style.borderColor = ''}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-4 rounded-xl font-bold text-lg transition
                ${canSubmit ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              style={canSubmit ? { backgroundColor: 'var(--primary, #1B2A4A)' } : {}}
            >
              {loading ? t('generating') : t('getCode')}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
