'use client'

import { useEffect, useMemo, useState } from 'react'
import { OccasionBanner } from '@/components/OccasionBanner'
import { labelDiet, labelOccasion } from '@/lib/labels'
import { useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

type Vendor = {
  id: string
  slug: string
  name: string
  city: string
  whatsapp_e164: string
  map_url: string | null
  hero_url: string | null
}

type CatalogItem = {
  id: string
  vendor_id: string
  kind: 'daily' | 'occasion'
  meal_slot: 'breakfast' | 'lunch' | 'dinner' | null
  title: string
  description: string | null
  price_gbp: number | null
  is_veg: boolean | null
}

export default function VendorStorefront({ params }: any) {
  const slug = params.slug as string
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [tab, setTab] = useState<'daily' | 'occasion'>('daily')
  const [slot, setSlot] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch')
  const [qty, setQty] = useState<Record<string, number>>({})
  const [note, setNote] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerWhatsApp, setCustomerWhatsApp] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().slice(0,10))
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryMapUrl, setDeliveryMapUrl] = useState('')
  const [saveAddress, setSaveAddress] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [sessionUser, setSessionUser] = useState<string | null>(null)
  const [deliveryFee, setDeliveryFee] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const supabase = supabaseBrowser()
      const v = await supabase.from('vendors').select('*').eq('slug', slug).single()
      if (v.error) {
        setStatus(v.error.message)
        return
      }
      setVendor(v.data)

      const c = await supabase
        .from('vendor_catalog')
        .select('*')
        .eq('vendor_id', v.data.id)
        .order('created_at', { ascending: true })
      if (c.error) {
        setStatus(c.error.message)
        return
      }
      setItems(c.data)
    })()
  }, [slug])

  const filtered = useMemo(() => {
    const base = items.filter((i) => i.kind === tab)
    if (tab === 'daily') return base.filter((i) => i.meal_slot === slot)
    return base
  }, [items, tab, slot])
  const subtotalGbp = useMemo(() => {
    return filtered.reduce((sum, i) => sum + (qty[i.id] || 0) * (i.price_gbp || 0), 0)
  }, [filtered, qty])

  const totalGbp = useMemo(() => {
    const fee = Number(deliveryFee || 0)
    return subtotalGbp + (Number.isFinite(fee) ? fee : 0)
  }, [subtotalGbp, deliveryFee])


  async function submitOrder() {
    setStatus(null)
    if (!vendor) return

    const selected = filtered
      .map((i) => ({ item_id: i.id, title: i.title, qty: qty[i.id] || 0, price_gbp: i.price_gbp }))
      .filter((x) => x.qty > 0)

    if (selected.length === 0) {
      setStatus('Select at least one item.')
      return
    }

    const supabase = supabaseBrowser()
    const { data, error } = await supabase
      .from('orders')
      .insert({
        vendor_id: vendor.id,
        order_type: tab,
        meal_slot: tab === 'daily' ? slot : null,
        customer_name: customerName || null,
        customer_whatsapp_e164: customerWhatsApp || null,
        delivery_time: deliveryTime || null,
        delivery_date: deliveryDate || null,
        delivery_address: deliveryAddress || null,
        delivery_map_url: deliveryMapUrl || null,
        delivery_fee_gbp: deliveryFee ? Number(deliveryFee) : null,
        total_gbp: totalGbp,
        items: selected,
        note,
        status: 'sent'
      })
      .select('id')
      .single()

    if (error) {
      setStatus(error.message)
      return
    }

    // Trigger WhatsApp notification (server route)
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toE164: vendor.whatsapp_e164,
        body:
          `New order on Desi Occasions\n` +
          `${tab === 'daily' ? `Meal: ${slot}` : 'Occasion order'}\n` +
          `Order link: ${process.env.NEXT_PUBLIC_APP_URL}/order/${data.id}`
      })
    })

    setStatus(`Order sent. Track here: /order/${data.id}`)
  }

  return (
    <>
      {!vendor ? (
        <p>{status || 'Loading vendor…'}</p>
      ) : (
        <>
          <div style={hero}>
            <div>
              <h1 className="h1">{vendor.name}</h1>
              <p style={{ margin: 0, opacity: 0.85 }}>{vendor.city} • WhatsApp orders</p>
              
            <div className="card">
              <h3 className="h3">Order summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Delivery fee (optional)</label>
                  <input value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="e.g., 3" className="input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.85 }}>Subtotal</span>
                    <b>£{subtotalGbp.toFixed(2)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ opacity: 0.85 }}>Total</span>
                    <b>£{totalGbp.toFixed(2)}</b>
                  </div>
                </div>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 13, opacity: 0.8 }}>
                Final pricing may vary for party orders; this is a helpful estimate.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <button onClick={() => setTab('daily')} style={chip(tab === 'daily')}>Daily Menu</button>
                <button onClick={() => setTab('occasion')} style={chip(tab === 'occasion')}>Occasion Packages</button>
                {vendor.map_url && (
                  <a href={vendor.map_url} target="_blank" style={linkBtn}>Open location</a>
                )}
              </div>

              {tab === 'daily' && (
                
            <div className="card">
              <h3 className="h3">Order summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Delivery fee (optional)</label>
                  <input value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="e.g., 3" className="input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.85 }}>Subtotal</span>
                    <b>£{subtotalGbp.toFixed(2)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ opacity: 0.85 }}>Total</span>
                    <b>£{totalGbp.toFixed(2)}</b>
                  </div>
                </div>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 13, opacity: 0.8 }}>
                Final pricing may vary for party orders; this is a helpful estimate.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <button onClick={() => setSlot('breakfast')} style={chip2(slot === 'breakfast')}>Breakfast</button>
                  <button onClick={() => setSlot('lunch')} style={chip2(slot === 'lunch')}>Lunch</button>
                  <button onClick={() => setSlot('dinner')} style={chip2(slot === 'dinner')}>Dinner</button>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="h3">{tab === 'daily' ? 'Select items' : 'Select packages'}</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {filtered.map((i) => (
                <div key={i.id} style={row}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{i.title}</div>
                    {i.description && <div style={{ fontSize: 13, opacity: 0.8 }}>{i.description}</div>}
                    <div style={{ fontSize: 13, opacity: 0.8 }}>
                      {i.price_gbp != null ? `£${i.price_gbp}` : 'Price on request'}
                      {i.is_veg != null ? ` • ${i.is_veg ? 'Veg' : 'Non-veg'}` : ''}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={qty[i.id] || 0}
                    onChange={(e) => setQty((q) => ({ ...q, [i.id]: parseInt(e.target.value || '0', 10) }))}
                    style={qtyInput}
                  />
                </div>
              ))}
            </div>


            <div className="grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="label">Your name</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g., Rahul" className="input" />
              </div>
              <div>
                <label className="label">Your WhatsApp (E.164)</label>
                <input value={customerWhatsApp} onChange={(e) => setCustomerWhatsApp(e.target.value)} placeholder="e.g., +447700900123" className="input" />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: 12 }}>
              <div>
                  <label className="label">Delivery date</label>
                  <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="input" />
                  <div style={{ height: 10 }} />
                  <label className="label">Delivery / pickup time</label>
                  <input value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="e.g., 1:00–2:00pm" className="input" />
                </div>
              <div>
                <label className="label">Google Maps link (optional)</label>
                <input value={deliveryMapUrl} onChange={(e) => setDeliveryMapUrl(e.target.value)} placeholder="Paste a maps share link" className="input" />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <label className="label">Saved addresses</label>
                  <select
                    className="input"
                    onChange={(e) => {
                      const id = e.target.value
                      const found = savedAddresses.find((x: any) => x.id === id)
                      if (found) {
                        setDeliveryAddress(found.address || '')
                        setDeliveryMapUrl(found.map_url || '')
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Select…</option>
                    {savedAddresses.map((a: any) => (
                      <option key={a.id} value={a.id}>{a.label || 'Address'}</option>
                    ))}
                  </select>
                </div>
              )}
              <label className="label">Delivery address / notes for vendor</label>
              <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Address, building entry notes, pickup preference, etc." className="textarea" />
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                Save this address for next time (requires login)
              </label>
              {sessionUser && <a href="/account/addresses" style={{ fontWeight: 800 }}>Manage saved addresses</a>}
              {!sessionUser && <span style={{ opacity: 0.75 }}>Sign in at /auth to use this.</span>}
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Additional notes (allergies, spice level, etc.)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} className="textarea" />
            </div>

            
            <div className="card">
              <h3 className="h3">Order summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Delivery fee (optional)</label>
                  <input value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="e.g., 3" className="input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.85 }}>Subtotal</span>
                    <b>£{subtotalGbp.toFixed(2)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ opacity: 0.85 }}>Total</span>
                    <b>£{totalGbp.toFixed(2)}</b>
                  </div>
                </div>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 13, opacity: 0.8 }}>
                Final pricing may vary for party orders; this is a helpful estimate.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <button onClick={submitOrder} style={primaryBtn}>Place order</button>
              <button
                onClick={async () => {
                  // Stripe deposit for occasion orders
                  if (!vendor) return
                  const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      mode: tab === 'daily' ? 'payment' : 'payment',
                      type: tab,
                      vendorId: vendor.id,
                      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/${vendor.slug}?paid=1`,
                      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/${vendor.slug}?canceled=1`
                    })
                  })
                  const j = await res.json()
                  if (j.url) window.location.href = j.url
                }}
                style={secondaryBtn}
              >
                {tab === 'occasion' ? 'Pay deposit (Stripe)' : 'Pay (Stripe)'}
              </button>
            </div>

            {status && <p style={{ marginTop: 12 }}>{status}</p>}
          </div>

          <div className="card">
            <h3 className="h3">Subscriptions</h3>
            <p style={{ marginTop: 0, opacity: 0.85 }}>
              Vendors can offer weekly/monthly meal plans. This repo includes a Stripe subscription scaffold.
            </p>
            <a href="/api/stripe/checkout" style={{ opacity: 0.7, fontSize: 13 }}>
              (Use API route with type=subscription in your UI)
            </a>
          </div>
        </>
      )}
    </>
  )
}

const hero: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(122,30,58,.10), rgba(244,162,97,.10))',
  border: '1px solid rgba(31,41,55,.12)',
  borderRadius: 16,
  padding: 16
}
const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(31,41,55,.12)',
  borderRadius: 16,
  padding: 16,
  marginTop: 12
}
const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  padding: 12,
  borderRadius: 14,
  border: '1px solid rgba(31,41,55,.10)'
}
const qtyInput: React.CSSProperties = { width: 70, padding: 10, borderRadius: 12, border: '1px solid rgba(31,41,55,.18)' }
const label: React.CSSProperties = { display: 'block', fontWeight: 800, fontSize: 12, opacity: 0.75, marginBottom: 6 }
const textarea: React.CSSProperties = { width: '100%', minHeight: 90, padding: 12, borderRadius: 12, border: '1px solid rgba(31,41,55,.18)' }
const primaryBtn: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 999,
  border: 'none',
  background: '#7A1E3A',
  color: '#FFF8F2',
  fontWeight: 900,
  cursor: 'pointer'
}
const secondaryBtn: React.CSSProperties = { ...primaryBtn, background: 'rgba(122,30,58,.10)', color: '#7A1E3A', border: '1px solid rgba(122,30,58,.25)' }
const linkBtn: React.CSSProperties = { ...secondaryBtn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }
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
      // Save address to address book (optional)
      if (saveAddress && sessionUser && deliveryAddress.trim()) {
        await supabase.from('customer_addresses').insert({
          user_id: sessionUser,
          label: null,
          address: deliveryAddress,
          map_url: deliveryMapUrl || null
        })
      }

