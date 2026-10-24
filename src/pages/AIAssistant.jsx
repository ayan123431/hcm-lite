import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

const KEY = import.meta.env.VITE_GEMINI_KEY
const MODEL = 'gemini-3.8-flash'

export default function AIAssistant() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const subs = [
      onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'attendance'), (s) => setAttendance(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'leaves'), (s) => setLeaves(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
    ]
    return () => subs.forEach((u) => u())
  }, [])

  const isEmp = profile?.role === 'employee'

  const buildContext = () => {
    const att = (isEmp ? attendance.filter((a) => a.uid === profile.id) : attendance)
      .slice(-100)
      .map((a) => `${a.name} | ${a.date} | ${a.status}`)
    const lv = (isEmp ? leaves.filter((l) => l.uid === profile.id) : leaves)
      .slice(-100)
      .map((l) => `${l.name} | ${l.type} | ${l.from} to ${l.to} | ${l.days} days | ${l.status}`)
    const staff = isEmp ? [] : users.map((u) => `${u.name} | ${u.role}`)
    return `Today: ${new Date().toISOString().slice(0, 10)}
Current user: ${profile?.name} (${profile?.role})
STAFF:\n${staff.join('\n')}
ATTENDANCE:\n${att.join('\n')}
LEAVES:\n${lv.join('\n')}`
  }

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    const next = [...messages, { role: 'user', text: q }]
    setMessages(next)
    setInput('')

    if (!KEY) {
      setMessages([...next, { role: 'ai', text: 'API key not found. Add VITE_GEMINI_KEY in the .env file and restart npm run dev.' }])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: `You are an HR assistant inside an HR management app. Answer briefly and clearly in English using only the data below. If the data does not contain the answer, say so.\n\n${buildContext()}`,
              }],
            },
            contents: next.map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.text }],
            })),
          }),
        }
      )
      const data = await res.json()
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.error?.message || 'No response'
      setMessages([...next, { role: 'ai', text: reply }])
    } catch (e) {
      setMessages([...next, { role: 'ai', text: 'Something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">AI Assistant</h1>
      <div className="bg-white rounded-xl shadow p-4 h-96 overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm">
            Try: "Who is late today?", "Who has pending leave requests?", "Summarize attendance this week"
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={`inline-block px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}>
              {m.text}
            </span>
          </div>
        ))}
        {loading && <p className="text-gray-500 text-sm">Thinking...</p>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button onClick={send} className="bg-teal-600 text-white px-4 rounded-lg">Send</button>
      </div>
    </div>
  )
}