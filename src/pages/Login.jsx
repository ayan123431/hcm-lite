import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError('Email ya password galat hai')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">HCM Lite Login</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border p-2 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border p-2 rounded" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-teal-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  )
}