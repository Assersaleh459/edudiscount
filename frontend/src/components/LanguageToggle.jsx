import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  return (
    <button
      onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
      className="px-3 py-1 text-sm font-medium rounded-full border border-white/30 text-white hover:bg-white/10 transition"
    >
      {isAr ? 'EN' : 'عربي'}
    </button>
  )
}
