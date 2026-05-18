import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ subjectId: '', name: '', nameAr: '', photoUrl: '', platformTeacherId: '', coursePrice: '', discountPct: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
    api.get('/admin/subjects').then((r) => setSubjects(r.data))
  }, [])

  async function load() {
    const { data } = await api.get('/admin/teachers')
    setTeachers(data)
  }

  async function save() {
    setSaving(true)
    try {
      const payload = { ...form, coursePrice: Math.round(Number(form.coursePrice) * 100), discountPct: Number(form.discountPct) }
      if (modal === 'add') await api.post('/admin/teachers', payload)
      else await api.put(`/admin/teachers/${modal.id}`, payload)
      setModal(null); load()
    } finally { setSaving(false) }
  }

  async function remove(t) {
    if (!confirm('Delete this teacher?')) return
    await api.delete(`/admin/teachers/${t.id}`)
    load()
  }

  const previewPrice = form.coursePrice && form.discountPct
    ? (Number(form.coursePrice) * (1 - Number(form.discountPct) / 100)).toFixed(0)
    : null

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">👨‍🏫 Teachers</h1>
        <button onClick={() => { setForm({ subjectId: subjects[0]?.id || '', name: '', nameAr: '', photoUrl: '', platformTeacherId: '', coursePrice: '', discountPct: '' }); setModal('add') }}
          className="bg-navy text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-light transition">+ Add Teacher</button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>{['Name', 'Subject', 'Price', 'Discount', 'Student Pays', 'Active', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-start">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map((t) => {
              const studentPays = (t.coursePrice / 100 * (1 - t.discountPct / 100)).toFixed(0)
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-navy">{t.name}</td>
                  <td className="px-4 py-3 text-gray-500">{t.subject?.name}</td>
                  <td className="px-4 py-3"><s className="text-gray-400">{(t.coursePrice / 100).toFixed(0)} EGP</s></td>
                  <td className="px-4 py-3"><span className="bg-teal/10 text-teal font-semibold px-2 py-0.5 rounded-full text-xs">{t.discountPct}%</span></td>
                  <td className="px-4 py-3 font-bold text-teal">{studentPays} EGP</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => { setForm({ subjectId: t.subjectId, name: t.name, nameAr: t.nameAr || '', photoUrl: t.photoUrl || '', platformTeacherId: t.platformTeacherId || '', coursePrice: (t.coursePrice / 100).toString(), discountPct: t.discountPct.toString() }); setModal(t) }} className="text-teal hover:underline text-xs">Edit</button>
                    <button onClick={() => remove(t)} className="text-red-400 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-navy mb-4">{modal === 'add' ? 'Add Teacher' : 'Edit Teacher'}</h2>
            <div className="space-y-3">
              <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none">
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.school?.name} — {s.name}</option>)}
              </select>
              <input placeholder="Name (English)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" />
              <input placeholder="Name (Arabic)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" dir="rtl" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Course Price (EGP)</label>
                  <input type="number" min="0" placeholder="e.g. 500" value={form.coursePrice} onChange={(e) => setForm({ ...form, coursePrice: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Discount %</label>
                  <input type="number" min="1" max="100" placeholder="e.g. 25" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" />
                </div>
              </div>
              {previewPrice && (
                <div className="bg-teal/10 rounded-lg px-4 py-2 text-sm text-teal font-medium">
                  Student pays: {previewPrice} EGP after {form.discountPct}% off
                </div>
              )}
              <input placeholder="Platform Teacher ID (optional)" value={form.platformTeacherId} onChange={(e) => setForm({ ...form, platformTeacherId: e.target.value })} className="w-full border-2 rounded-lg px-3 py-2 focus:border-teal focus:outline-none" />
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
