'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

type Order = {
  id: string
  vendor_id: string
  status: string
  order_type: string
  meal_slot: string | null
  delivery_date: string | null
  delivery_time: string | null
  total_gbp: number | null
}

type Vendor = { id: string; slug: string; name: string; whatsapp_e164: string }

export default function OrderConfirmation({ params }: any) {
  const supabase = supabaseBrowser()
  const [order, setOrder] = useState<Order | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    ;(async () => {
      const o = await supabase.from('orders').select('*').eq('id', params.id).single()
      if (!o.error && o.data) {
        setOrder(o.data as any)
        const v = await supabase.from('vendors').select('id,slug,name,whatsapp_e164').eq('id', o.data.vendor_id).single()
        if (!v.error && v.data) setVendor(v.data as any)
      }
    })()
  }, [params.id, supabase])

  if (!order) return <p>Loading…</p>

  return (
    <div className="container">
      <div className="card warm">
        <h1 className="h1">Order placed 🎉</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Your order has been sent to {vendor?.name || 'the vendor'}. You can track updates anytime.
        </p>
      </div>

      <div className="card">
        <h3 className="h3">Summary</h3>
        <p style={{ margin: '6px 0' }}>
          <b>Type:</b> {order.order_type}{order.meal_slot ? ` • ${order.meal_slot}` : ''}
        </p>
        <p style={{ margin: '6px 0' }}>
          <b>When:</b> {order.delivery_date || '—'} {order.delivery_time ? `(${order.delivery_time})` : ''}
        </p>
        <p style={{ margin: '6px 0' }}>
          <b>Status:</b> {order.status.replaceAll('_',' ')}
        </p>
        {order.total_gbp != null && (
          <p style={{ margin: '6px 0' }}>
            <b>Total:</b> £{Number(order.total_gbp).toFixed(2)}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          {order.order_type === 'occasion' && (
            <button
              onClick={async () => {
                const res = await fetch('/api/stripe/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'occasion',
                    amount_gbp: 20,
                    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}`,
                    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}`,
                    metadata: { order_id: order.id }
                  })
                })
                const j = await res.json()
                if (j.url) window.location.href = j.url
              }}
              className="btn primary"
            >
              Pay deposit
            </button>
          )}
          
          <a href={`/order/${order.id}`} className="btn primary">View tracking</a>
          {order.order_type === 'daily' && (
            <button
              onClick={async () => {
                const priceId = process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID
                if (!priceId) return
                const res = await fetch('/api/stripe/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'subscription',
                    price_id: priceId,
                    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}`,
                    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}`,
                    metadata: { order_id: order.id }
                  })
                })
                const j = await res.json()
                if (j.url) window.location.href = j.url
              }}
              className="btn"
            >
              Subscribe (weekly/monthly)
            </button>
          )}
          {vendor && <a href={`/vendor/${vendor.slug}`} className="btn">Back to vendor</a>}
          {vendor && (
            <a
              href={`https://wa.me/${(vendor.whatsapp_e164 || '').replace('+','')}`}
              className="btn"
              target="_blank"
              rel="noreferrer"
            >
              Message vendor on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const btn: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(122,30,58,.25)',
  background: 'rgba(122,30,58,.10)',
  textDecoration: 'none',
  color: '#1F2937',
  fontWeight: 900
}
const btn2: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(31,41,55,.18)',
  background: '#fff',
  textDecoration: 'none',
  color: '#1F2937',
  fontWeight: 900
}
