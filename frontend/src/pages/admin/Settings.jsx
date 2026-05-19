import { useEffect, useRef, useState } from 'react'
import api from '../../api/client'
import { useTheme } from '../../context/ThemeContext'

function AutoTextarea({ value, onChange, dir, placeholder }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value || ''}
      onChange={onChange}
      dir={dir}
      placeholder={placeholder}
      rows={1}
      style={{ resize: 'none', overflow: 'hidden' }}
      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-teal focus:outline-none text-sm"
    />
  )
}

export default function Settings() {
  const { refetch } = useTheme()
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.get('/admin/settings').then((r) => setSettings(r.data))
  }, [])

  async function save() {
    setSaving(true)
    await api.put('/admin/settings', settings)
    setSaving(false); setSaved(true)
    refetch()
    setTimeout(() => setSaved(false), 2000)
  }

  function set(key, value) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setLogoError(false)
    try {
      const form = new FormData()
      form.append('logo', file)
      const { data } = await api.post('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      set('logoUrl', data.url)
    } catch {
      alert('Upload failed. Max size is 5MB. Allowed: JPG, PNG, GIF, WebP, SVG.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (!settings) return <div className="p-8 text-gray-400">Loading...</div>

  const welcomeFields = [
    { key: 'welcomeTitle',      label: 'Welcome Title (English)' },
    { key: 'welcomeTitleAr',    label: 'Welcome Title (Arabic)', dir: 'rtl' },
    { key: 'welcomeSubtitle',   label: 'Welcome Subtitle (English)' },
    { key: 'welcomeSubtitleAr', label: 'Welcome Subtitle (Arabic)', dir: 'rtl' },
  ]

  const systemFields = [
    { key: 'partnerApiUrl',  label: 'Partner API URL' },
    { key: 'defaultCurrency', label: 'Default Currency' },
    { key: 'smtpHost',       label: 'SMTP Host' },
    { key: 'smtpPort',       label: 'SMTP Port' },
    { key: 'smtpUser',       label: 'SMTP User' },
    { key: 'smtpFrom',       label: 'From Email' },
  ]

  const pageColors = [
    { key: 'welcomePageBg',  label: 'Welcome Page' },
    { key: 'selectorPageBg', label: 'Selector Page' },
    { key: 'codePageBg',     label: 'Code Page' },
  ]

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-navy">⚙ Settings</h1>

      {/* Appearance section */}
      <section className="bg-white rounded-xl shadow p-6 space-y-6">
        <h2 className="text-lg font-semibold text-navy border-b pb-2">Appearance</h2>

        {/* Logo / Icon — used everywhere on all pages */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Logo / Icon <span className="text-gray-400 font-normal">(shown on all pages)</span></label>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />

          <div className="flex items-start gap-4">
            {/* Preview box */}
            <div className="w-20 h-20 rounded-xl bg-navy/10 flex items-center justify-center overflow-hidden border-2 border-gray-200 flex-shrink-0">
              {settings.logoUrl && !logoError ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" onError={() => setLogoError(true)} />
              ) : (
                <span className="text-4xl">{settings.welcomeIcon || '🎓'}</span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              {/* Upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="w-full px-4 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-light transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? <><span className="animate-spin">⏳</span> Uploading...</> : <><span>📁</span> Upload Image</>}
              </button>

              {/* Or URL */}
              <input
                value={settings.logoUrl || ''}
                onChange={(e) => { set('logoUrl', e.target.value); setLogoError(false) }}
                placeholder="Or paste image URL..."
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-teal focus:outline-none text-sm"
              />

              {settings.logoUrl && (
                <button type="button" onClick={() => { set('logoUrl', ''); setLogoError(false) }} className="text-xs text-red-400 hover:text-red-600">
                  Remove image — use emoji fallback
                </button>
              )}
            </div>
          </div>

          {/* Emoji fallback (only shown when no image) */}
          {!settings.logoUrl && (
            <div className="mt-3 flex items-center gap-3">
              <label className="text-xs text-gray-400 whitespace-nowrap">Fallback emoji:</label>
              <input
                value={settings.welcomeIcon || ''}
                onChange={(e) => set('welcomeIcon', e.target.value)}
                placeholder="🎓"
                className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-teal focus:outline-none text-2xl text-center"
              />
            </div>
          )}
        </div>

        {/* Per-page background colors */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-3 block">Page Background Colors</label>
          <div className="grid grid-cols-3 gap-4">
            {pageColors.map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-xl border-2 border-gray-200 overflow-hidden cursor-pointer shadow-sm"
                  style={{ backgroundColor: settings[key] || '#1B2A4A' }}
                >
                  <input
                    type="color"
                    value={settings[key] || '#1B2A4A'}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-gray-500 text-center">{label}</span>
                <span className="text-xs font-mono text-gray-400">{settings[key] || '#1B2A4A'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accent + Primary colors */}
        <div className="grid grid-cols-2 gap-6">
          {[
            { key: 'accentColor',  label: 'Accent Color',  hint: 'Buttons & highlights' },
            { key: 'primaryColor', label: 'Primary Color', hint: 'Cards & nav elements' },
          ].map(({ key, label, hint }) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-500">{label}</label>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 overflow-hidden cursor-pointer shadow-sm flex-shrink-0"
                  style={{ backgroundColor: settings[key] || '#1B2A4A' }}
                >
                  <input
                    type="color"
                    value={settings[key] || '#1B2A4A'}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <p className="text-sm font-mono text-gray-700">{settings[key] || '#1B2A4A'}</p>
                  <p className="text-xs text-gray-400">{hint}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live mini-preview */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Live Preview</label>
          <div
            className="rounded-xl p-4 flex items-center justify-between"
            style={{ backgroundColor: settings.welcomePageBg || '#1B2A4A' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: settings.accentColor || '#00B8A9' }}
              >
                25%
              </div>
              <span className="text-white font-semibold">{settings.welcomeTitle || 'EduDiscount'}</span>
            </div>
            {settings.logoUrl
              ? <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              : <span className="text-2xl">{settings.welcomeIcon || '🎓'}</span>
            }
          </div>
        </div>
      </section>

      {/* Welcome Page content section */}
      <section className="bg-white rounded-xl shadow p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy border-b pb-2">Welcome Page Text</h2>

        {welcomeFields.map(({ key, label, dir }) => (
          <div key={key}>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
            <AutoTextarea
              value={settings[key]}
              onChange={(e) => set(key, e.target.value)}
              dir={dir}
            />
          </div>
        ))}
      </section>

      {/* System settings section */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-navy border-b pb-2">System</h2>
        {systemFields.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
            <input
              value={settings[key] || ''}
              onChange={(e) => set(key, e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-teal focus:outline-none text-sm"
            />
          </div>
        ))}
      </section>

      <button
        onClick={save} disabled={saving}
        className="bg-navy text-white px-8 py-3 rounded-xl font-semibold hover:bg-navy-light transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Settings'}
      </button>
    </div>
  )
}
