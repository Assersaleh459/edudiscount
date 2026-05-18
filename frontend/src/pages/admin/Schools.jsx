import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function Schools() {
  const [schools, setSchools] = useState([])
  const [modal, setModal] = useState(null) // null | 'add' | school object
  const [form, setForm] = useState({ name: '', nameAr: '', language: 'Arabic', logoUrl: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await api.get('/admin/schools')
    setSchools(data)
  }

  function openAdd() { setForm({ name: '', nameAr: '', language: 'Arabic', logoUrl: '' }); setModal('add') }
  function openEdit(s) { setForm({ name: s.name, nameAr: s.nameAr || '', language: s.language, logoUrl: s.logoUrl || '' }); setModal(s) }

  async function save() {
    setSaving(true)
    try {
      if (modal === 'add') await api.post('/admin/schools', form)
      else await api.put(`/admin/schools/${modal.id}`, form)
      setModal(null); load()
    } finally { setSaving(false) }
  }

  async function toggleActive(s) {
    await api.put(`/admin/schools/${s.id}`, { isActive: !s.isActive })
    load()
  }

  async function remove(s) {
    if (!confirm('Delete this school?')) return
    await api.delete(`/admin/schools/${s.id}`)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">🏫 Schools</h1>
        <button onClick={openAdd} className="bg-navy text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-light transition">
          + Add School
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              {['Name', 'Arabic Name', 'Language', 'Active', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-start">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schools.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.nameAr || '—'}</td>
                <td className="px-4 py-3">{s.language}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(s)}
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-teal hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(s)} className="text-red-400 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-navy mb-4">{modal === 'add' ? 'Add School' : 'Edit School'}</h2>
            <div className="space-y-3">
              <input placeholder="Name (English)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" />
              <input placeholder="Name (Arabic)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" dir="rtl" />
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none">
                <option>Arabic</option><option>English</option>
              </select>
              <input placeholder="Logo URL (optional)" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={save} disabled={saving} className="flex-1 bg-navy text-white py-2 rounded-lg font-semibold hover:bg-navy-light transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 py-2 rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
