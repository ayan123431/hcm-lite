import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

const today = () => new Date().toISOString().slice(0, 10)

export default function MyAttendance() {
  const { profile } = useAuth()
  const [records, setRecords] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!profile) return
    const q = query(collection(db, 'attendance'), where('uid', '==', profile.id))
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => b.date.localeCompare(a.date))
      setRecords(list)
    })
  }, [profile])

  const todayRecord = records.find((r) => r.date === today())

  const checkIn = async () => {
    const now = new Date()
    // Office start 09:00, grace 15 min => late after 09:15
    const minutes = now.getHours() * 60 + now.getMinutes()
    const status = minutes > 9 * 60 + 15 ? 'late' : 'present'
    await addDoc(collection(db, 'attendance'), {
      uid: profile.id,
      name: profile.name,
      date: today(),
      checkIn: now.toISOString(),
      checkOut: null,
      status,
      createdAt: serverTimestamp(),
    })
    setMsg('Check-in ho gaya')
  }

  const checkOut = async () => {
    await updateDoc(doc(db, 'attendance', todayRecord.id), { checkOut: new Date().toISOString() })
    setMsg('Check-out ho gaya')
  }

  const fmt = (iso) => (iso ? new Date(iso).toLocaleTimeString() : '-')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Attendance</h1>
      <div className="bg-white p-4 rounded-xl shadow flex gap-3 items-center">
        {!todayRecord && <button onClick={checkIn} className="bg-teal-600 text-white px-4 py-2 rounded">Check In</button>}
        {todayRecord && !todayRecord.checkOut && <button onClick={checkOut} className="bg-orange-600 text-white px-4 py-2 rounded">Check Out</button>}
        {todayRecord?.checkOut && <p>Aaj ka kaam khatam</p>}
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>
      <div className="bg-white rounded-xl shadow divide-y">
        {records.length === 0 && <p className="p-4 text-gray-500">Abhi koi record nahi</p>}
        {records.map((r) => (
          <div key={r.id} className="p-3 flex justify-between">
            <span>{r.date}</span>
            <span>In: {fmt(r.checkIn)} | Out: {fmt(r.checkOut)}</span>
            <span className="capitalize font-semibold">{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}