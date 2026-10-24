import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, doc, setDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore'
import { db, getSecondaryAuth } from '../lib/firebase'

export default function CreateUser({ role, title }) {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', role))
    return onSnapshot(q, (snap) => setList(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
  }, [role])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      const sAuth = getSecondaryAuth()
      const cred = await createUserWithEmailAndPassword(sAuth, form.email, form.password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: form.name,
        email: form.email,
        role,
        mustChangePassword: true,
        createdAt: serverTimestamp(),
      })
      await signOut(sAuth)
      setForm({ name: '', email: '', password: '' })
      setMsg('Ban gaya!')
    } catch (err) {
      setMsg(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-2">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="border p-2 rounded" />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="border p-2 rounded" />
        <input placeholder="Temporary password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} className="border p-2 rounded" />
        <button disabled={loading} className="bg-teal-600 text-white px-4 rounded">{loading ? '...' : 'Create'}</button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
      <div className="bg-white rounded-xl shadow divide-y">
        {list.length === 0 && <p className="p-4 text-gray-500">Abhi kuch nahi hai</p>}
        {list.map((u) => (
          <div key={u.id} className="p-3">{u.name} | {u.email}</div>
        ))}
      </div>
    </div>
  )
}