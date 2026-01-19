'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

type Addr = { id: string; label: string | null; address: string; map_url: string | null }

export default function Addresses() {
  const supabase = supabaseBrowser()
  const [sessionUser, setSessionUser] = useState<string | null>(null)
  const [items, setItems] = useState<Addr[]>([])
  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const s = await supabase.auth.getSession()
      const uid = s.data.session?.user.id || null
      setSessionUser(uid)
      if (!uid) return
      const r = await supabase.from('customer_addresses').select('*').eq('user_id', uid).order('created_at', { ascending: false })
      if (!r.error) setItems((r.data || []) as any)
    })()
  }, [supabase])

  async function add() {
    setMsg(null)
    if (!sessionUser) { setMsg('Please sign in first.'); return }
    if (!address.trim()) { setMsg('Address required'); return }
    const ins = await supabase.from('customer_addresses').insert({
      user_id: sessionUser,
      label: label || null,
      address,
      map_url: mapUrl || null
    }).select('*').single()
    if (ins.error) { setMsg('Could not save'); return }
    setItems(prev => [ins.data as any, ...prev])
    setLabel(''); setAddress(''); setMapUrl('')
    setMsg('Saved')
  }

  async function remove(id: string) {
    if (!sessionUser) return
    await supabase.from('customer_addresses').delete().eq('id', id)
    setItems(prev => prev.filter(x => x.id !== id))
  }

  return (
    <div className="container">
      <h1 className="h1">Saved addresses</h1>
      <p style={{ marginTop: 6, opacity: 0.85 }}>Use these for faster daily orders.</p>

      <div style={{ ...card, marginTop: 14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">Label (optional)</label>
            <input value={label} onChange={(e)=>setLabel(e.target.value)} placeholder="Home / Office" className="input"/>
          </div>
          <div>
            <label className="label">Google Maps link (optional)</label>
            <input value={mapUrl} onChange={(e)=>setMapUrl(e.target.value)} placeholder="Paste a maps share link" className="input"/>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <label className="label">Address</label>
          <textarea value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Full address and delivery notes" className="textarea"/>
        </div>
        <div style={{ display:'flex', gap: 10, flexWrap:'wrap', marginTop: 10, alignItems:'center' }}>
          <button onClick={add} className="btn primary">Save address</button>
          {!sessionUser && <span style={{ opacity: 0.85 }}>Sign in at /auth to use this.</span>}
          {msg && <span style={{ opacity: 0.85 }}>{msg}</span>}
        </div>
      </div>

      <div style={{ marginTop: 14, display:'grid', gap: 12 }}>
        {items.map(a => (
          <div key={a.id} style={{ ...card, background:'#fff' }}>
            <div style={{ display:'flex', justifyContent:'space-between', gap: 12, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontWeight: 900 }}>{a.label || 'Address'}</div>
                <div style={{ marginTop: 6, whiteSpace:'pre-wrap' }}>{a.address}</div>
                {a.map_url && <div style={{ marginTop: 6 }}><a href={a.map_url} target="_blank" rel="noreferrer">Open location</a></div>}
              </div>
              <div>
                <button onClick={() => remove(a.id)} className="btn">Remove</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="card"><p style={{ margin: 0, opacity: 0.85 }}>No saved addresses yet.</p></div>}
      </div>
    </div>
  )
}

const card: React.CSSProperties = { border:'1px solid rgba(31,41,55,.12)', borderRadius:16, padding:16, background:'rgba(255,248,242,.6)' }
const labelStyle: React.CSSProperties = { display:'block', fontSize:13, fontWeight:800, opacity:.85, marginBottom:6 }
const input: React.CSSProperties = { width:'100%', padding:'10px 12px', borderRadius:12, border:'1px solid rgba(31,41,55,.18)' }
const textarea: React.CSSProperties = { width:'100%', minHeight: 86, padding:'10px 12px', borderRadius:12, border:'1px solid rgba(31,41,55,.18)' }
const btn: React.CSSProperties = { padding:'10px 12px', borderRadius:12, border:'1px solid rgba(122,30,58,.25)', background:'rgba(122,30,58,.10)', cursor:'pointer', fontWeight:900 }
const btn2: React.CSSProperties = { padding:'10px 12px', borderRadius:12, border:'1px solid rgba(31,41,55,.18)', background:'#fff', cursor:'pointer', fontWeight:900 }
