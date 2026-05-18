import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [schools, setSchools] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ schoolId: '', name: '', nameAr: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
    api.get('/admin/schools').then((r) => setSchools(r.data))
  }, [])

  async function load() {
    const { data } = await api.get('/admin/subjects')
    setSubjects(data)
  }

  async function save() {
    setSaving(true)
    try {
      if (modal === 'add') await api.post('/admin/subjects', form)
      else await api.put(`/admin/subjects/${modal.id}`, form)
      setModal(null); load()
    } finally { setSaving(false) }
  }

  async function remove(s) {
    if (!confirm('Delete this subject?')) return
    await api.delete(`/admin/subjects/${s.id}`)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">📚 Subjects</h1>
        <button onClick={() => { setForm({ schoolId: schools[0]?.id || '', name: '', nameAr: '' }); setModal('add') }}
          className="bg-navy text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-light transition">+ Add Subject</button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>{['Name', 'Arabic Name', 'School', 'Active', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-start">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subjects.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.nameAr || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{s.school?.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setForm({ schoolId: s.schoolId, name: s.name, nameAr: s.nameAr || '' }); setModal(s) }} className="text-teal hover:underline text-xs">Edit</button>
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
            <h2 className="text-lg font-bold text-navy mb-4">{modal === 'add' ? 'Add Subject' : 'Edit Subject'}</h2>
            <div className="space-y-3">
              <select value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none">
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input placeholder="Name (English)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" />
              <input placeholder="Name (Arabic)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" dir="rtl" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={save} disabled={saving} className="flex-1 bg-navy text-white py-2 rounded-lg font-semibold hover:bg-navy-light transition disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 py-2 rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
