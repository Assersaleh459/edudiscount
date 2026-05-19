import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/client'

function SearchableDropdown({ placeholder, options, value, onChange, disabled, loading }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const filtered = options.filter((o) => {
    const label = isAr && o.nameAr ? o.nameAr : o.name
    return label.toLowerCase().includes(search.toLowerCase())
  })

  const selectedLabel = value
    ? (isAr && options.find((o) => o.id === value)?.nameAr) || options.find((o) => o.id === value)?.name
    : null

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-start transition
          ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-teal cursor-pointer'}
          ${value ? 'border-teal text-navy font-medium' : 'text-gray-500'}`}
      >
        <span>{selectedLabel || (loading ? '...' : placeholder)}</span>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
          >
            <div className="p-2 border-b">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-teal"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-400">No results</li>
              )}
              {filtered.map((opt) => (
                <li
                  key={opt.id}
                  onClick={() => { onChange(opt); setOpen(false); setSearch('') }}
                  className="px-4 py-3 text-sm cursor-pointer hover:bg-teal/10 hover:text-teal transition"
                >
                  {(isAr && opt.nameAr) ? opt.nameAr : opt.name}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CascadeSelector({ onSelectionChange, isVerified = true, onSchoolChange }) {
  const { t } = useTranslation()
  const [schools, setSchools] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selected, setSelected] = useState({ school: null, subject: null, teacher: null })
  const [loading, setLoading] = useState({ schools: true, subjects: false, teachers: false })

  useEffect(() => {
    api.get('/schools').then((r) => { setSchools(r.data); setLoading((l) => ({ ...l, schools: false })) })
  }, [])

  function selectSchool(school) {
    setSelected({ school, subject: null, teacher: null })
    setSubjects([]); setTeachers([])
    onSelectionChange({ school, subject: null, teacher: null })
    if (onSchoolChange) onSchoolChange(school)
  }

  useEffect(() => {
    if (!selected.school || !isVerified) return
    setLoading((l) => ({ ...l, subjects: true }))
    api.get(`/subjects?schoolId=${selected.school.id}`).then((r) => {
      setSubjects(r.data)
      setLoading((l) => ({ ...l, subjects: false }))
    })
  }, [selected.school, isVerified])

  function selectSubject(subject) {
    setSelected((s) => ({ ...s, subject, teacher: null }))
    setTeachers([])
    setLoading((l) => ({ ...l, teachers: true }))
    api.get(`/teachers?subjectId=${subject.id}`).then((r) => {
      setTeachers(r.data)
      setLoading((l) => ({ ...l, teachers: false }))
    })
    onSelectionChange({ school: selected.school, subject, teacher: null })
  }

  function selectTeacher(teacher) {
    setSelected((s) => ({ ...s, teacher }))
    onSelectionChange({ school: selected.school, subject: selected.subject, teacher })
  }

  return (
    <div className="space-y-4">
      <SearchableDropdown
        placeholder={t('selectSchool')}
        options={schools}
        value={selected.school?.id}
        onChange={selectSchool}
        loading={loading.schools}
      />
      <AnimatePresence>
        {selected.school && isVerified && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <SearchableDropdown
              placeholder={t('selectSubject')}
              options={subjects}
              value={selected.subject?.id}
              onChange={selectSubject}
              disabled={loading.subjects}
              loading={loading.subjects}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selected.subject && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <SearchableDropdown
              placeholder={t('selectTeacher')}
              options={teachers}
              value={selected.teacher?.id}
              onChange={selectTeacher}
              disabled={loading.teachers}
              loading={loading.teachers}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
