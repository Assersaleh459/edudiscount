import { Routes, Route, Navigate } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import SelectorPage from './pages/SelectorPage'
import CodePage from './pages/CodePage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Schools from './pages/admin/Schools'
import Subjects from './pages/admin/Subjects'
import Teachers from './pages/admin/Teachers'
import Codes from './pages/admin/Codes'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/Settings'

function RequireAdmin({ children }) {
  const token = localStorage.getItem('admin_token')
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/select" element={<SelectorPage />} />
      <Route path="/code/:codeId" element={<CodePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={<RequireAdmin><AdminLayout /></RequireAdmin>}
      >
        <Route index element={<Navigate to="/admin/schools" replace />} />
        <Route path="schools" element={<Schools />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="codes" element={<Codes />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
