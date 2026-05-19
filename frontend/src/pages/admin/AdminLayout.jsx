import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import PageIcon from '../../components/PageIcon'

const NAV = [
  { to: '/admin/schools', label: '🏫 Schools' },
  { to: '/admin/subjects', label: '📚 Subjects' },
  { to: '/admin/teachers', label: '👨‍🏫 Teachers' },
  { to: '/admin/codes', label: '🎟 Codes' },
  { to: '/admin/reports', label: '📊 Reports' },
  { to: '/admin/settings', label: '⚙ Settings' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-navy flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-white font-bold text-lg flex items-center gap-2"><PageIcon size="sm" /> EduDiscount</span>
          <p className="text-white/50 text-xs mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium transition
                ${isActive ? 'bg-teal text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mx-4 mb-4 py-2 text-sm text-white/50 hover:text-white border border-white/20 rounded-lg transition"
        >
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
