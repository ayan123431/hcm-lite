import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export default function Setup({ onDone }) {
  const [form, setForm] = useState({
    companyName: '',
    adminName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: form.adminName,
        email: form.email,
        role: 'admin',
        createdAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'settings', 'company'), {
        name: form.companyName,
        createdAt: serverTimestamp(),
      })
      onDone && onDone()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">HCM Lite Setup</h1>
        <p className="text-sm text-gray-500">Company aur pehla Admin banayein</p>
        <input name="companyName" placeholder="Company name" value={form.companyName} onChange={change} required className="w-full border p-2 rounded" />
        <input name="adminName" placeholder="Admin name" value={form.adminName} onChange={change} required className="w-full border p-2 rounded" />
        <input name="email" type="email" placeholder="Admin email" value={form.email} onChange={change} required className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Password (min 6)" value={form.password} onChange={change} required minLength={6} className="w-full border p-2 rounded" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-teal-600 text-white p-2 rounded">
          {loading ? 'Creating...' : 'Create Company & Admin'}
        </button>
      </form>
    </div>
  )
}