import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './lib/firebase'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Setup from './pages/Setup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CompanySetup from './pages/CompanySetup'
import Departments from './pages/Departments'
import LeaveTypes from './pages/LeaveTypes'
import HRUsers from './pages/HRUsers'
import Employees from './pages/Employees'
import MyAttendance from './pages/MyAttendance'
import Attendance from './pages/Attendance'
import MyLeaves from './pages/MyLeaves'
import Leaves from './pages/Leaves'
import AIAssistant from './pages/AIAssistant'

function Router() {
  const { user, loading, refreshProfile } = useAuth()
  const [companyExists, setCompanyExists] = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'settings', 'company')).then((s) => setCompanyExists(s.exists()))
  }, [user])

  if (loading || companyExists === null) return <p className="p-6">Loading...</p>
  if (!companyExists) return <Setup onDone={() => { setCompanyExists(true); refreshProfile() }} />
  if (!user) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/company" element={<CompanySetup />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/leave-types" element={<LeaveTypes />} />
        <Route path="/hr-users" element={<HRUsers />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/my-attendance" element={<MyAttendance />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/my-leaves" element={<MyLeaves />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="*" element={<p>Coming soon</p>} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}