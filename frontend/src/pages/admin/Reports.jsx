import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../api/client'

export default function Reports() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/admin/reports').then((r) => setData(r.data))
  }, [])

  if (!data) return <div className="p-8 text-gray-400">Loading reports...</div>

  const { summary, bySchoolMonth, teacherStats } = data

  // Convert bySchoolMonth object to chart-friendly array
  const monthKeys = [...new Set(Object.keys(bySchoolMonth).map((k) => k.split('__')[1]))].sort()
  const schoolKeys = [...new Set(Object.keys(bySchoolMonth).map((k) => k.split('__')[0]))]
  const chartData = monthKeys.map((month) => {
    const entry = { month }
    schoolKeys.forEach((school) => { entry[school] = bySchoolMonth[`${school}__${month}`] || 0 })
    return entry
  })

  const COLORS = ['#1A2A5E', '#0D9488', '#6366f1', '#f59e0b']

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-navy">📊 Reports</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Schools', value: summary.activeSchools, color: 'text-navy' },
          { label: 'Total Teachers', value: summary.totalTeachers, color: 'text-teal' },
          { label: 'Codes Issued', value: summary.totalCodes, color: 'text-indigo-600' },
          { label: 'Redemption Rate', value: summary.totalCodes ? `${Math.round((summary.usedCodes / summary.totalCodes) * 100)}%` : '0%', color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-5 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Codes per school per month */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-navy mb-4">Codes Issued Per School (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            {schoolKeys.map((school, i) => (
              <Bar key={school} dataKey={school} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Teacher stats table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <h2 className="font-semibold text-navy px-6 py-4 border-b">Teacher Performance</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>{['Teacher', 'Total Codes', 'Redeemed', 'Redemption Rate', 'Total Discount Given'].map((h) => <th key={h} className="px-4 py-3 text-start">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teacherStats.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy">{t.name}</td>
                <td className="px-4 py-3">{t.totalCodes}</td>
                <td className="px-4 py-3">{t.usedCodes}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                      <div className="h-full bg-teal rounded-full" style={{ width: `${t.redemptionRate}%` }} />
                    </div>
                    <span className="text-teal font-semibold">{t.redemptionRate}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-teal">{(t.totalDiscountGiven / 100).toFixed(0)} {t.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
