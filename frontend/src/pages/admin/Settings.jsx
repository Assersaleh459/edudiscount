import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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

  const fields = [
    { key: 'partnerApiUrl', label: 'Partner API URL' },
    { key: 'defaultCurrency', label: 'Default Currency' },
    { key: 'smtpHost', label: 'SMTP Host' },
    { key: 'smtpPort', label: 'SMTP Port' },
    { key: 'smtpUser', label: 'SMTP User' },
    { key: 'smtpFrom', label: 'From Email' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-navy mb-6">⚙ Settings</h1>
      <div className="bg-white rounded-xl shadow p-6 max-w-lg space-y-4">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
            <input
              value={settings[key] || ''}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-teal focus:outline-none text-sm"
            />
          </div>
        ))}
        <button
          onClick={save} disabled={saving}
          className="bg-navy text-white px-6 py-2 rounded-lg font-semibold hover:bg-navy-light transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
