import { useEffect, useState } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function SimpleCrud({ title, col, fields }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({})

  useEffect(() => {
    return onSnapshot(collection(db, col), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [col])

  const submit = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, col), { ...form, createdAt: serverTimestamp() })
    setForm({})
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-2">
        {fields.map((f) => (
          <input
            key={f.name}
            type={f.type || 'text'}
            placeholder={f.label}
            value={form[f.name] || ''}
            onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            required
            className="border p-2 rounded"
          />
        ))}
        <button className="bg-teal-600 text-white px-4 rounded">Add</button>
      </form>
      <div className="bg-white rounded-xl shadow divide-y">
        {items.length === 0 && <p className="p-4 text-gray-500">Abhi kuch nahi hai</p>}
        {items.map((it) => (
          <div key={it.id} className="p-3 flex justify-between items-center">
            <span>{fields.map((f) => `${f.label}: ${it[f.name]}`).join('  |  ')}</span>
            <button onClick={() => deleteDoc(doc(db, col, it.id))} className="text-red-600 text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}