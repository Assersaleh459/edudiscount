import { useEffect, useState } from 'react'
import api from '../../api/client'

const STATUS_COLORS = { ACTIVE: 'bg-green-100 text-green-700', USED: 'bg-blue-100 text-blue-700', EXPIRED: 'bg-red-100 text-red-500' }

export default function Codes() {
  const [codes, setCodes] = useState([])
  const [status, setStatus] = useState('ALL')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [status, email])

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (status !== 'ALL') params.set('status', status)
    if (email) params.set('email', email)
    const { data } = await api.get(`/admin/codes?${params}`)
    setCodes(data)
    setLoading(false)
  }

  function exportCsv() {
    const params = new URLSearchParams({ export: 'csv' })
    if (status !== 'ALL') params.set('status', status)
    if (email) params.set('email', email)
    window.open(`/api/admin/codes?${params}`, '_blank')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">🎟 Codes</h1>
        <button onClick={exportCsv} className="bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-dark transition text-sm">Export CSV</button>
      </div>
      <div className="flex gap-3 mb-4">
        {['ALL', 'ACTIVE', 'USED', 'EXPIRED'].map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${status === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
        <input placeholder="Search by email..." value={email} onChange={(e) => setEmail(e.target.value)}
          className="ms-auto border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-teal focus:outline-none w-56" />
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>{['Code', 'Email', 'Teacher', 'Discount', 'Pays', 'Status', 'Expires'].map((h) => <th key={h} className="px-4 py-3 text-start">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : codes.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-semibold text-navy text-xs">{c.code}</td>
                <td className="px-4 py-3 text-gray-600">{c.studentEmail}</td>
                <td className="px-4 py-3 text-gray-600">{c.teacher?.name}</td>
                <td className="px-4 py-3"><span className="bg-teal/10 text-teal text-xs font-bold px-2 py-0.5 rounded-full">{c.discountPct}%</span></td>
                <td className="px-4 py-3 font-semibold text-teal">{(c.finalPrice / 100).toFixed(0)} {c.currency}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[c.status]}`}>{c.status}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.expiresAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
