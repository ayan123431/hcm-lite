import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Attendance() {
  const [records, setRecords] = useState([])

  useEffect(() => {
    return onSnapshot(collection(db, 'attendance'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => b.date.localeCompare(a.date))
      setRecords(list)
    })
  }, [])

  const fmt = (iso) => (iso ? new Date(iso).toLocaleTimeString() : '-')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Attendance (All Employees)</h1>
      <div className="bg-white rounded-xl shadow divide-y">
        {records.length === 0 && <p className="p-4 text-gray-500">Abhi koi record nahi</p>}
        {records.map((r) => (
          <div key={r.id} className="p-3 flex justify-between">
            <span>{r.name}</span>
            <span>{r.date}</span>
            <span>In: {fmt(r.checkIn)} | Out: {fmt(r.checkOut)}</span>
            <span className="capitalize font-semibold">{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}