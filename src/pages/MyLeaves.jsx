import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000) + 1

export default function MyLeaves() {
  const { profile } = useAuth()
  const [types, setTypes] = useState([])
  const [leaves, setLeaves] = useState([])
  const [form, setForm] = useState({ type: '', from: '', to: '', reason: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    return onSnapshot(collection(db, 'leaveTypes'), (s) => setTypes(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
  }, [])

  useEffect(() => {
    if (!profile) return
    const q = query(collection(db, 'leaves'), where('uid', '==', profile.id))
    return onSnapshot(q, (s) => setLeaves(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
  }, [profile])

  const used = (typeName) =>
    leaves.filter((l) => l.type === typeName && l.status === 'approved').reduce((n, l) => n + l.days, 0)

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    if (form.to < form.from) return setMsg('End date start se pehle nahi ho sakti')
    const days = daysBetween(form.from, form.to)
    const t = types.find((x) => x.name === form.type)
    const remaining = Number(t?.quota || 0) - used(form.type)
    if (days > remaining) return setMsg(`Balance kaafi nahi hai (bache: ${remaining})`)
    await addDoc(collection(db, 'leaves'), {
      uid: profile.id,
      name: profile.name,
      type: form.type,
      from: form.from,
      to: form.to,
      days,
      reason: form.reason,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    setForm({ type: '', from: '', to: '', reason: '' })
    setMsg('Request bhej di gayi')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Leaves</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {types.length === 0 && <p className="text-gray-500">Admin ne abhi leave types nahi banaye</p>}
        {types.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded-xl shadow">
            <p className="font-semibold">{t.name}</p>
            <p className="text-2xl font-bold">{Number(t.quota) - used(t.name)} <span className="text-sm text-gray-500">/ {t.quota} bache</span></p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-2">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className="border p-2 rounded">
          <option value="">Leave type</option>
          {types.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
        <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} required className="border p-2 rounded" />
        <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required className="border p-2 rounded" />
        <input placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required className="border p-2 rounded" />
        <button className="bg-teal-600 text-white px-4 rounded">Apply</button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}

      <div className="bg-white rounded-xl shadow divide-y">
        {leaves.length === 0 && <p className="p-4 text-gray-500">Abhi koi request nahi</p>}
        {leaves.map((l) => (
          <div key={l.id} className="p-3 flex justify-between">
            <span>{l.type} ({l.days} din)</span>
            <span>{l.from} to {l.to}</span>
            <span className="capitalize font-semibold">{l.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}