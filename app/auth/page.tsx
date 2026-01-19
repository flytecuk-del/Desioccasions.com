'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function sendMagicLink() {
    setStatus(null)
    const supabase = supabaseBrowser()
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    })
    if (error) {
      setStatus(error.message)
      return
    }
    setStatus('Check your email for a magic link.')
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Sign in (Magic Link)</h2>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        For vendors/admin. Guests can browse and order without signing in.
      </p>
      <label className="label">Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="vendor@example.com"
        className="input"
      />
      <button onClick={sendMagicLink} style={button}>Send magic link</button>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(31,41,55,.12)',
  borderRadius: 16,
  padding: 16
}
const label: React.CSSProperties = { display: 'block', fontWeight: 800, fontSize: 12, opacity: 0.75, marginTop: 8 }
const input: React.CSSProperties = { width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(31,41,55,.18)', marginTop: 6 }
const button: React.CSSProperties = { marginTop: 12, padding: '10px 14px', borderRadius: 999, border: 'none', background: '#7A1E3A', color: '#FFF8F2', fontWeight: 800, cursor: 'pointer' }
