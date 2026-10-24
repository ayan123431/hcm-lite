import { useEffect, useState } from 'react'
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export default function Leaves() {
  const { profile } = useAuth()
  const [leaves, setLeaves] = useState([])

  useEffect(() => {
    return onSnapshot(collection(db, 'leaves'), (s) => setLeaves(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
  }, [])

  const decide = async (l, status) => {
    const comment = window.prompt('Comment likho (zaroori):')
    if (!comment) return
    await updateDoc(doc(db, 'leaves', l.id), {
      status,
      comment,
      decidedBy: profile.name,
    })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leave Requests</h1>
      <div className="bg-white rounded-xl shadow divide-y">
        {leaves.length === 0 && <p className="p-4 text-gray-500">Abhi koi request nahi</p>}
        {leaves.map((l) => (
          <div key={l.id} className="p-3 flex flex-wrap justify-between items-center gap-2">
            <span>{l.name} | {l.type} ({l.days} din)</span>
            <span>{l.from} to {l.to}</span>
            <span className="capitalize font-semibold">{l.status}</span>
            {l.status === 'pending' && (
              <span className="flex gap-2">
                <button onClick={() => decide(l, 'approved')} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                <button onClick={() => decide(l, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}