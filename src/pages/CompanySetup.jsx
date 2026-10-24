import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

const empty = {
  name: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  workStart: '09:00',
  workEnd: '17:00',
}

export default function CompanySetup() {
  const { profile } = useAuth()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const canEdit = profile?.role === 'admin'

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'company', 'main'))
        if (snap.exists()) setForm({ ...empty, ...snap.data() })
      } catch (e) {
        setMsg('Could not load company details')
      }
      setLoading(false)
    }
    load()
  }, [])

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const save = async () => {
    if (!form.name.trim()) {
      setMsg('Company name is required')
      return
    }
    setSaving(true)
    setMsg('')
    try {
      await setDoc(doc(db, 'company', 'main'), form, { merge: true })
      setMsg('Saved successfully!')
    } catch (e) {
      setMsg('Could not save. Please try again.')
    }
    setSaving(false)
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  const Field = ({ label, name, type = 'text' }) => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={form[name]}
        onChange={change}
        disabled={!canEdit}
        className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
      />
    </div>
  )

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Company Setup</h1>
      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <Field label="Company Name" name="name" />
        <Field label="Company Email" name="email" type="email" />
        <Field label="Phone" name="phone" />
        <Field label="Address" name="address" />
        <Field label="Website" name="website" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Work Start Time" name="workStart" type="time" />
          <Field label="Work End Time" name="workEnd" type="time" />
        </div>
        {canEdit ? (
          <button
            onClick={save}
            disabled={saving}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        ) : (
          <p className="text-sm text-gray-500">Only Admin can edit company details.</p>
        )}
        {msg && <p className="text-sm text-teal-700">{msg}</p>}
      </div>
    </div>
  )
}