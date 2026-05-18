import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    api.get('/admin/settings').then((r) => setSettings(r.data))
  }, [])

  async function save() {
    setSaving(true)
    await api.put('/admin/settings', settings)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-navy">⚙ Settings</h1>

      {/* Welcome Page section */}
      <section className="bg-white rounded-xl shadow p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy border-b pb-2">Welcome Page</h2>

        {/* Logo URL + live preview */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Logo URL</label>
          <input
            value={settings.logoUrl || ''}
            onChange={(e) => { setSettings({ ...settings, logoUrl: e.target.value }); setLogoError(false) }}
            placeholder="https://example.com/logo.png"
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-teal focus:outline-none text-sm"
          />
          <div className="mt-3 flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-navy/10 flex items-center justify-center overflow-hidden border border-gray-200">
              {settings.logoUrl && !logoError ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-1"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-4xl">🎓</span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {settings.logoUrl && !logoError ? 'Preview above' : 'Enter a URL to preview your logo'}
            </p>
          </div>
        </div>

        {welcomeFields.map(({ key, label, dir }) => (
          <div key={key}>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
            <input
              value={settings[key] || ''}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              dir={dir}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-teal focus:outline-none text-sm"
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
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
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
