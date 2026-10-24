import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

const today = () => new Date().toISOString().slice(0, 10)

function Card({ label, value, color = 'text-teal-600' }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function lastDays(n) {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    const subs = [
      onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'attendance'), (s) => setAttendance(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'leaves'), (s) => setLeaves(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'departments'), (s) => setDepartments(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
    ]
    return () => subs.forEach((u) => u())
  }, [])

  const isEmp = profile?.role === 'employee'
  const employees = users.filter((u) => u.role === 'employee')
  const hrs = users.filter((u) => u.role === 'hr')

  const todayAtt = attendance.filter((a) => a.date === today())
  const present = todayAtt.filter((a) => a.status === 'present').length
  const late = todayAtt.filter((a) => a.status === 'late').length
  const onLeave = leaves.filter((l) => l.status === 'approved' && l.from <= today() && l.to >= today()).length
  const pending = leaves.filter((l) => l.status === 'pending')
  const absent = Math.max(0, employees.length - present - late - onLeave)

  const myAtt = attendance.filter((a) => a.uid === profile?.id)
  const myLeaves = leaves.filter((l) => l.uid === profile?.id)

  const attSource = isEmp ? myAtt : attendance
  const days = lastDays(7)
  const chart = days.map((d) => ({
    day: d.slice(5),
    count: attSource.filter((a) => a.date === d).length,
  }))
  const max = Math.max(1, ...chart.map((c) => c.count))

  const leaveSource = isEmp ? myLeaves : leaves
  const activity = [
    ...attSource.map((a) => ({
      id: 'a' + a.id,
      time: a.checkIn ? new Date(a.checkIn).getTime() : 0,
      text: `${a.name} checked in (${a.status})`,
    })),
    ...leaveSource.map((l) => ({
      id: 'l' + l.id,
      time: l.createdAt?.toMillis ? l.createdAt.toMillis() : 0,
      text: `${l.name}: ${l.type} leave ${l.status}`,
    })),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 6)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome, {profile?.name}</h1>
      <p className="text-gray-600 capitalize">{profile?.role} dashboard</p>

      {profile?.role === 'admin' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card label="Total Employees" value={employees.length} />
          <Card label="HR Users" value={hrs.length} />
          <Card label="Departments" value={departments.length} />
          <Card label="Pending Leaves" value={pending.length} color="text-orange-600" />
          <Card label="Present Today" value={present} />
          <Card label="Late Today" value={late} color="text-red-600" />
          <Card label="On Leave" value={onLeave} color="text-purple-600" />
          <Card label="Absent" value={absent} color="text-gray-600" />
        </div>
      )}

      {profile?.role === 'hr' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card label="Headcount" value={employees.length} />
          <Card label="Present Today" value={present} />
          <Card label="Late Today" value={late} color="text-red-600" />
          <Card label="On Leave Today" value={onLeave} color="text-purple-600" />
          <Card label="Absent" value={absent} color="text-gray-600" />
          <Card label="Pending Approvals" value={pending.length} color="text-orange-600" />
        </div>
      )}

      {isEmp && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card label="Days Present" value={myAtt.filter((a) => a.status === 'present').length} />
          <Card label="Days Late" value={myAtt.filter((a) => a.status === 'late').length} color="text-red-600" />
          <Card label="Pending Requests" value={myLeaves.filter((l) => l.status === 'pending').length} color="text-orange-600" />
          <Card label="Approved Leave Days" value={myLeaves.filter((l) => l.status === 'approved').reduce((n, l) => n + l.days, 0)} color="text-purple-600" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Attendance: Last 7 Days</h2>
          <div className="flex items-end gap-2 h-40">
            {chart.map((c) => (
              <div key={c.day} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs mb-1">{c.count}</span>
                <div className="w-full bg-teal-500 rounded-t" style={{ height: `${(c.count / max) * 100}%`, minHeight: c.count ? 4 : 0 }} />
                <span className="text-xs text-gray-500 mt-1">{c.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Recent Activity</h2>
          {activity.length === 0 && <p className="text-gray-500 text-sm">No activity yet</p>}
          <ul className="space-y-2 text-sm">
            {activity.map((a) => (
              <li key={a.id} className="border-b pb-2">{a.text}</li>
            ))}
          </ul>
        </div>
      </div>

      {!isEmp && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Pending Leave Requests</h2>
          {pending.length === 0 && <p className="text-gray-500 text-sm">No pending requests</p>}
          <ul className="space-y-2 text-sm">
            {pending.map((l) => (
              <li key={l.id} className="border-b pb-2">
                {l.name} | {l.type} ({l.days} days) | {l.from} to {l.to}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}