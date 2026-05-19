import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const defaults = {
  logoUrl: '',
  welcomeIcon: '🎓',
  welcomeTitle: 'EduDiscount',
  welcomeTitleAr: 'EduDiscount',
  welcomeSubtitle: 'Get your student discount in seconds',
  welcomeSubtitleAr: 'احصل على خصمك الطلابي في ثوانٍ',
  primaryColor: '#1B2A4A',
  accentColor: '#00B8A9',
  welcomePageBg: '#1B2A4A',
  selectorPageBg: '#1B2A4A',
  codePageBg: '#1B2A4A',
}

const ThemeContext = createContext({ ...defaults, refetch: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaults)

  const applyTheme = useCallback((data) => {
    const s = { ...defaults, ...data }
    setTheme(s)
    const root = document.documentElement
    root.style.setProperty('--primary', s.primaryColor)
    root.style.setProperty('--accent', s.accentColor)
    root.style.setProperty('--welcome-bg', s.welcomePageBg)
    root.style.setProperty('--selector-bg', s.selectorPageBg)
    root.style.setProperty('--code-bg', s.codePageBg)
  }, [])

  const refetch = useCallback(() => {
    api.get('/public/settings').then(r => applyTheme(r.data)).catch(() => {})
  }, [applyTheme])

  useEffect(() => { refetch() }, [refetch])

  return (
    <ThemeContext.Provider value={{ ...theme, refetch }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
