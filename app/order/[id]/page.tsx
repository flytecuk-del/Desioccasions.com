'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

type Order = {
  id: string
  vendor_id: string
  status: string
  order_type: 'daily' | 'occasion'
  meal_slot: string | null
  items: any
  note: string | null
  customer_name: string | null
  customer_whatsapp_e164: string | null
  delivery_address: string | null
  delivery_map_url: string | null
  delivery_time: string | null
  created_at: string
}

type Vendor = {
  id: string
  name: string
  whatsapp_e164: string
}

const STATUSES = ['sent', 'confirmed', 'in_progress', 'out_for_delivery', 'completed', 'cancelled'] as const

export default function OrderPage({ params }: any) {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [order, setOrder] = useState<Order | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isVendor, setIsVendor] = useState(false)

  useEffect(() => {
    ;(async () => {
      const o = await supabase.from('orders').select('*').eq('id', params.id).single()
      if (o.error) return setStatus(o.error.message)
      setOrder(o.data)

      const v = await supabase.from('vendors').select('id,name,whatsapp_e164').eq('id', o.data.vendor_id).single()
      if (v.error) return setStatus(v.error.message)
      setVendor(v.data)
    })()
  }, [params.id, supabase])

  async function updateStatus(next: string) {
    if (!order || !vendor) return
    setStatus(null)

    const u = await supabase.from('orders').update({ status: next }).eq('id', order.id).select('*').single()
    if (u.error) return setStatus(u.error.message)
    setOrder(u.data)

    // Notify vendor (or customer, once customer contact is added)
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toE164: vendor.whatsapp_e164,
        body: `Order update on Desi Occasions\nOrder: ${order.id}\nNew status: ${next.replaceAll('_',' ')}\nTrack: ${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}`
      })
    })

    if (order.customer_whatsapp_e164) {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toE164: order.customer_whatsapp_e164,
          body:
            `Your order update on Desi Occasions\n` +
            `New status: ${next.replaceAll('_',' ')}\n` +
            `Track: ${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}`
        })
      })
    }
  }

  if (!order) return <p>{status || 'Loading order…'}</p>

  return (
    <div className="card">
      <h2 className="h2">Order #{order.id}</h2>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Status: <b>{order.status}</b>
      </p>

      {isVendor && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          <button onClick={() => updateStatus('confirmed')} className="btn primary">Accept order</button>
          <button onClick={() => updateStatus('cancelled')} className="btn">Decline order</button>
        </div>
      )}

      <p style={{ margin: 0, opacity: 0.85 }}>
      </p>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Type: {order.order_type}{order.meal_slot ? ` • ${order.meal_slot}` : ''}
      </p>

      <div style={{ marginTop: 10, padding: 12, borderRadius: 14, border: '1px solid rgba(31,41,55,.12)', background: 'rgba(255,248,242,.7)' }}>
        <p style={{ margin: 0, opacity: 0.9 }}><b>Customer:</b> {order.customer_name || '—'}</p>
        <p style={{ margin: '6px 0 0', opacity: 0.9 }}><b>WhatsApp:</b> {order.customer_whatsapp_e164 || '—'}</p>
        <p style={{ margin: '6px 0 0', opacity: 0.9 }}><b>When:</b> {order.delivery_time || '—'}</p>
        <p style={{ margin: '6px 0 0', opacity: 0.9 }}><b>Address:</b> {order.delivery_address || '—'}</p>
        {order.delivery_map_url && (
          <p style={{ margin: '6px 0 0' }}>
            <a href={order.delivery_map_url} target="_blank" rel="noreferrer">Open location in Maps</a>
          </p>
        )}
      </div>

      {order.order_type === 'daily' && (
        <div style={{ marginTop: 12 }}>
          <a href={`/vendor/${vendor.slug}?tab=daily&reorder=${order.id}`} className="btn">Reorder (daily)</a>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <h3 className="h3">Items</h3>
        <pre style={pre}>{JSON.stringify(order.items, null, 2)}</pre>
      </div>

      {order.note && (
        <div style={{ marginTop: 12 }}>
          <h3 className="h3">Notes</h3>
          <p style={{ margin: 0 }}>{order.note}</p>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <h3 className="h3">Update status</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => updateStatus(s)} style={chip(order.status === s)}>
              {s.replaceAll('_', ' ')}
            </button>
          ))}
        </div>
      </div>

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
const pre: React.CSSProperties = {
  margin: 0,
  padding: 12,
  borderRadius: 14,
  background: 'rgba(31,41,55,.06)',
  overflowX: 'auto'
}
const chip = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 999,
  border: active ? '1px solid rgba(122,30,58,.45)' : '1px solid rgba(31,41,55,.18)',
  background: active ? 'rgba(122,30,58,.10)' : '#fff',
  cursor: 'pointer',
  fontWeight: 800
})


const primaryBtn: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(122,30,58,.25)',
  background: 'rgba(122,30,58,.10)',
  cursor: 'pointer',
  fontWeight: 900
}
const dangerBtn: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(180,0,0,.25)',
  background: 'rgba(180,0,0,.08)',
  cursor: 'pointer',
  fontWeight: 900
}
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
