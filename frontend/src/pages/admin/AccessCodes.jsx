import { useEffect, useState } from 'react'
import api from '../../api/client'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 font-mono transition">
      {copied ? '✓' : '📋'}
    </button>
  )
}

function EditModal({ code, onSave, onClose }) {
  const [label, setLabel] = useState(code.label || '')
  const [maxUses, setMaxUses] = useState(code.maxUses)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await onSave(code.id, { label, maxUses: Number(maxUses) })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="font-bold text-navy text-lg">Edit Student Code</h3>
        <p className="font-mono text-sm text-gray-500">{code.code}</p>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Label (student name / ID)</label>
          <input value={label} onChange={e => setLabel(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Max Uses</label>
          <input type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal focus:outline-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2 border-2 border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AccessCodes() {
  const [schools, setSchools] = useState([])
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [studentCodes, setStudentCodes] = useState([])
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [genCount, setGenCount] = useState(10)
  const [genPrefix, setGenPrefix] = useState('')
  const [genMaxUses, setGenMaxUses] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => {
    api.get('/admin/access-codes/schools').then(r => setSchools(r.data))
  }, [])

  useEffect(() => {
    if (!selectedSchoolId) { setStudentCodes([]); return }
    setLoadingCodes(true)
    api.get(`/admin/access-codes/students?schoolId=${selectedSchoolId}`)
      .then(r => setStudentCodes(r.data))
      .finally(() => setLoadingCodes(false))
  }, [selectedSchoolId])

  async function generateSchoolCode(schoolId) {
    const { data } = await api.post(`/admin/access-codes/schools/${schoolId}/generate`)
    setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, accessCode: data.accessCode } : s))
  }

  async function bulkGenerate() {
    if (!selectedSchoolId) return
    setGenerating(true)
    try {
      const { data } = await api.post('/admin/access-codes/students/generate', {
        schoolId: selectedSchoolId,
        count: genCount,
        labelPrefix: genPrefix,
        maxUses: genMaxUses,
      })
      setStudentCodes(prev => [...data.codes, ...prev])
    } finally {
      setGenerating(false)
    }
  }

  async function updateCode(id, updates) {
    const { data } = await api.put(`/admin/access-codes/students/${id}`, updates)
    setStudentCodes(prev => prev.map(c => c.id === id ? data : c))
  }

  async function toggleActive(code) {
    await updateCode(code.id, { isActive: !code.isActive })
  }

  async function deleteCode(id) {
    if (!confirm('Delete this student code?')) return
    await api.delete(`/admin/access-codes/students/${id}`)
    setStudentCodes(prev => prev.filter(c => c.id !== id))
  }

  function exportCsv() {
    const school = schools.find(s => s.id === selectedSchoolId)
    window.open(`/api/admin/access-codes/students/export?schoolId=${selectedSchoolId}`, '_blank')
  }

  const selectedSchool = schools.find(s => s.id === selectedSchoolId)

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">🔑 Access Codes</h1>

      {/* Section 1 — School Codes */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-navy border-b pb-2">School Codes</h2>
        <p className="text-xs text-gray-400">Each school has one master code. Students must enter it along with their personal code.</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b">
              <th className="pb-2 font-medium">School</th>
              <th className="pb-2 font-medium">Current Code</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {schools.map(school => (
              <tr key={school.id} className="border-b last:border-0">
                <td className="py-3 font-medium text-navy">{school.name}</td>
                <td className="py-3">
                  {school.accessCode
                    ? <span className="flex items-center gap-2">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{school.accessCode}</span>
                        <CopyBtn text={school.accessCode} />
                      </span>
                    : <span className="text-gray-400 text-xs italic">Not generated</span>
                  }
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => generateSchoolCode(school.id)}
                    className="text-xs px-3 py-1.5 bg-navy text-white rounded-lg hover:bg-navy-light transition"
                  >
                    {school.accessCode ? 'Regenerate' : 'Generate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Section 2 — Student Codes */}
      <section className="bg-white rounded-xl shadow p-6 space-y-5">
        <h2 className="text-lg font-semibold text-navy border-b pb-2">Student Codes</h2>

        {/* School picker */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSchoolId}
            onChange={e => setSelectedSchoolId(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal focus:outline-none flex-1"
          >
            <option value="">— Select a school —</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {selectedSchoolId && (
            <button onClick={exportCsv}
              className="text-sm px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition whitespace-nowrap">
              ⬇ Export CSV
            </button>
          )}
        </div>

        {selectedSchoolId && (
          <>
            {/* Bulk generate form */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-navy">Bulk Generate</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Count</label>
                  <input type="number" min="1" max="500" value={genCount}
                    onChange={e => setGenCount(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Label Prefix <span className="text-gray-300">(optional)</span></label>
                  <input value={genPrefix} onChange={e => setGenPrefix(e.target.value)}
                    placeholder="e.g. Grade-11"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Max Uses per Code</label>
                  <input type="number" min="1" value={genMaxUses}
                    onChange={e => setGenMaxUses(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal focus:outline-none" />
                </div>
              </div>
              <button onClick={bulkGenerate} disabled={generating}
                className="px-5 py-2 bg-teal text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition">
                {generating ? 'Generating...' : `Generate ${genCount} Codes`}
              </button>
            </div>

            {/* Codes table */}
            {loadingCodes
              ? <p className="text-gray-400 text-sm">Loading...</p>
              : studentCodes.length === 0
                ? <p className="text-gray-400 text-sm text-center py-6">No student codes yet. Generate some above.</p>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-400 border-b">
                          <th className="pb-2 font-medium">Code</th>
                          <th className="pb-2 font-medium">Label</th>
                          <th className="pb-2 font-medium">Uses</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentCodes.map(code => (
                          <tr key={code.id} className={`border-b last:border-0 ${!code.isActive ? 'opacity-50' : ''}`}>
                            <td className="py-2.5">
                              <span className="flex items-center gap-1.5">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{code.code}</span>
                                <CopyBtn text={code.code} />
                              </span>
                            </td>
                            <td className="py-2.5 text-gray-600">{code.label || <span className="text-gray-300 italic">—</span>}</td>
                            <td className="py-2.5">
                              <span className={`font-medium ${code.useCount >= code.maxUses ? 'text-red-500' : 'text-navy'}`}>
                                {code.useCount}
                              </span>
                              <span className="text-gray-400"> / {code.maxUses}</span>
                            </td>
                            <td className="py-2.5">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                !code.isActive ? 'bg-gray-100 text-gray-400' :
                                code.useCount >= code.maxUses ? 'bg-red-100 text-red-600' :
                                'bg-green-100 text-green-600'}`}>
                                {!code.isActive ? 'Disabled' : code.useCount >= code.maxUses ? 'Exhausted' : 'Active'}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setEditTarget(code)}
                                  className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">Edit</button>
                                <button onClick={() => toggleActive(code)}
                                  className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
                                  {code.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button onClick={() => deleteCode(code.id)}
                                  className="text-xs px-2 py-1 border border-red-200 text-red-400 rounded hover:bg-red-50">Del</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
            }
          </>
        )}
      </section>

      {editTarget && (
        <EditModal
          code={editTarget}
          onSave={updateCode}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
