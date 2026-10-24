import { NavLink } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

const menus = {
  admin: [
    { to: '/', label: 'Dashboard' },
    { to: '/company', label: 'Company Setup' },
    { to: '/departments', label: 'Departments' },
    { to: '/leave-types', label: 'Leave Types' },
    { to: '/hr-users', label: 'HR Users' },
    { to: '/ai', label: 'AI Assistant' },
  ],
  hr: [
    { to: '/', label: 'Dashboard' },
    { to: '/employees', label: 'Employees' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leaves', label: 'Leaves' },
    { to: '/ai', label: 'AI Assistant' },
  ],
  employee: [
    { to: '/', label: 'Dashboard' },
    { to: '/my-attendance', label: 'My Attendance' },
    { to: '/my-leaves', label: 'My Leaves' },
    { to: '/ai', label: 'AI Assistant' },
  ],
}

export default function Layout({ children }) {
  const { profile } = useAuth()
  const links = menus[profile?.role] || []

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 bg-slate-900 text-white p-4 space-y-2">
        <h2 className="text-xl font-bold mb-4">HCM Lite</h2>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${isActive ? 'bg-teal-600' : 'hover:bg-slate-700'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <div className="pt-6 text-sm text-slate-300">
          <p>{profile?.name}</p>
          <p className="capitalize">{profile?.role}</p>
          <button onClick={() => signOut(auth)} className="mt-2 bg-red-600 px-3 py-1 rounded text-white">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}