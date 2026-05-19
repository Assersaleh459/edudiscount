import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import PageIcon from '../../components/PageIcon'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/admin/auth/login', form)
      localStorage.setItem('admin_token', data.token)
      navigate('/admin/schools')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center"><PageIcon size="sm" /></div>
          <h1 className="text-2xl font-bold text-navy mt-2">Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" required placeholder="Email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none"
          />
          <input
            type="password" required placeholder="Password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
