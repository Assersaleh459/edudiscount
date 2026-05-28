import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '')

function resolveUrl(url) {
  if (!url) return url
  if (url.startsWith('http')) return url
  return API_BASE + url
}

export default function PageIcon({ size = 'sm' }) {
  const theme = useTheme()
  const [imgError, setImgError] = useState(false)
  const sizeClass = size === 'lg' ? 'w-40 h-40' : 'w-8 h-8'
  const textSize  = size === 'lg' ? 'text-8xl' : 'text-2xl'

  if (theme.logoUrl && !imgError) {
    return (
      <img
        src={resolveUrl(theme.logoUrl)}
        alt="Logo"
        className={`${sizeClass} object-contain`}
        onError={() => setImgError(true)}
      />
    )
  }

  return <span className={textSize}>{theme.welcomeIcon || '🎓'}</span>
}
