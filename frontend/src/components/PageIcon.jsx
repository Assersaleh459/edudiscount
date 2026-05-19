import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function PageIcon({ size = 'sm' }) {
  const theme = useTheme()
  const [imgError, setImgError] = useState(false)
  const sizeClass = size === 'lg' ? 'w-40 h-40' : 'w-8 h-8'
  const textSize  = size === 'lg' ? 'text-8xl' : 'text-2xl'

  if (theme.logoUrl && !imgError) {
    return (
      <img
        src={theme.logoUrl}
        alt="Logo"
        className={`${sizeClass} object-contain`}
        onError={() => setImgError(true)}
      />
    )
  }

  return <span className={textSize}>{theme.welcomeIcon || '🎓'}</span>
}
