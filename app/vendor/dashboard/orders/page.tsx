'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

type Vendor = { id: string; name: string; slug: string }
type Order = {
  id: string
  status: string
  order_type: string
  meal_slot: string | null
  delivery_date: string | null
  delivery_time: string | null
  customer_name: string | null
  customer_whatsapp_e164: string | null
  total_gbp: number | null
}

const SLOTS = ['breakfast', 'lunch', 'dinner'] as const
const STATUSES = ['sent', 'confirmed', 'in_progress', 'out_for_delivery', 'completed', 'cancelled'] as const

export default function VendorOrdersToday() {
  const supabase = supabaseBrowser()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>('lunch')
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      // In production: resolve vendor by session.user.id
      const v = await supabase.from('vendors').select('id,name,slug').limit(1).maybeSingle()
      if (v.data) setVendor(v.data as any)
    })()
  }, [supabase])

  useEffect(() => {
    if (!vendor) return
    ;(async () => {
      const q = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendor.id)
        .eq('order_type', 'daily')
        .eq('meal_slot', slot)
        .eq('delivery_date', day)
        .order('created_at', { ascending: false })
      if (!q.error) setOrders((q.data || []) as any)
    })()
  }, [vendor, slot, day, supabase])

  const counts = useMemo(() => {
    const by: Record<string, number> = {}
    for (const s of STATUSES) by[s] = 0
    for (const o of orders) by[o.status] = (by[o.status] || 0) + 1
    return by
  }, [orders])

  async function setOrderStatus(orderId: string, next: string, customerWhats?: string | null) {
    if (!vendor) return
    setStatus(null)
    const u = await supabase.from('orders').update({ status: next }).eq('id', orderId).select('*').single()
    if (u.error) {
      setStatus('Could not update status')
      return
    }
    setOrders((prev) => prev.map((p) => (p.id === orderId ? ({ ...(p as any), status: next } as any) : p)))
    setStatus(`Updated ${orderId} → ${next.replaceAll('_', ' ')}`)

    // Notify customer (optional)
    if (customerWhats) {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toE164: customerWhats,
          body:
            `Your order update on Desi Occasions\n` +
            `New status: ${next.replaceAll('_', ' ')}\n` +
            `Track: ${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}`
        })
      })
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="h1">Today’s orders</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85 }}>
            {vendor ? vendor.name : 'Vendor'} • Daily meals
          </p>
        </div>
        <a href="/vendor/dashboard" className="btn">Back to dashboard</a>
      </div>

      <div className="card warm">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SLOTS.map((s) => (
              <button key={s} onClick={() => setSlot(s)} style={chip(s === slot)}>{s}</button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ opacity: 0.85 }}>Date</label>
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="input" />
          </div>
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap', opacity: 0.85, fontSize: 13 }}>
          {STATUSES.map((s) => (
            <span key={s}><b>{counts[s] || 0}</b> {s.replaceAll('_',' ')}</span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {orders.length === 0 && (
          <div className="card">
            <p style={{ margin: 0, opacity: 0.85 }}>No orders for {slot} on {day}.</p>
          </div>
        )}

        {orders.map((o) => (
          <div key={o.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 900 }}>Order #{o.id}</div>
                <div style={{ marginTop: 4, opacity: 0.85 }}>
                  {o.customer_name || 'Customer'} • {o.delivery_time || 'time TBD'}
                </div>
                {o.total_gbp != null && <div style={{ marginTop: 4 }}><b>£{Number(o.total_gbp).toFixed(2)}</b></div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ opacity: 0.85 }}>Status</div>
                <div style={{ fontWeight: 900 }}>{o.status.replaceAll('_',' ')}</div>
                <a href={`/order/${o.id}`} style={{ display: 'inline-block', marginTop: 8, fontWeight: 800 }}>Open tracking</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {['confirmed','in_progress','out_for_delivery','completed','cancelled'].map((s) => (
                <button key={s} onClick={() => setOrderStatus(o.id, s, o.customer_whatsapp_e164)} style={chip2(o.status === s)}>
                  {s.replaceAll('_',' ')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {status && <div className="card warm">{status}</div>}
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(31,41,55,.12)',
  borderRadius: 16,
  padding: 16
}
const input: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(31,41,55,.18)'
}
const chip = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 999,
  border: active ? '1px solid rgba(122,30,58,.45)' : '1px solid rgba(31,41,55,.18)',
  background: active ? 'rgba(122,30,58,.10)' : '#fff',
  cursor: 'pointer',
  fontWeight: 800
})
const chip2 = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 999,
  border: active ? '1px solid rgba(244,162,97,.55)' : '1px solid rgba(31,41,55,.18)',
  background: active ? 'rgba(244,162,97,.16)' : '#fff',
  cursor: 'pointer',
  fontWeight: 800
})
const linkBtn: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(31,41,55,.18)',
  background: '#fff',
  textDecoration: 'none',
  color: '#1F2937',
  fontWeight: 900
}
