'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import { OccasionBanner } from '@/components/OccasionBanner'
import { labelDiet, labelOccasion } from '@/lib/labels'

type Vendor = {
  id: string
  name: string
  slug: string
  city: string | null
  whatsapp_e164: string | null
  map_url: string | null
  categories: string[] | null
  cover_image_url: string | null
  gallery_urls: string[] | null
  menu_pdf_url: string | null
  is_verified: boolean | null
  supported_occasions: string[] | null
  dietary_tags: string[] | null
  packages: any[] | null
}

export default function VendorPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()

  const slug = params?.slug
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [status, setStatus] = useState<string>('')

  // Order form (simple but functional)
  const [mode, setMode] = useState<'daily' | 'occasion'>('daily')
  const [slot, setSlot] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch')
  const [qty, setQty] = useState<number>(1)
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  const bannerKind = useMemo(() => {
    const cats = vendor?.categories || []
    if (cats.includes('pandit')) return 'navratri'
    if (cats.includes('dj') || cats.includes('decor')) return 'wedding'
    if ((vendor?.dietary_tags || []).includes('halal')) return 'eid'
    return 'diwali'
  }, [vendor])

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      setStatus('Loading vendor…')
      const { data, error } = await supabase
        .from('vendors')
        .select(
          'id,name,slug,city,whatsapp_e164,map_url,categories,cover_image_url,gallery_urls,menu_pdf_url,is_verified,supported_occasions,dietary_tags,packages'
        )
        .eq('slug', slug)
        .single()

      if (error) {
        setStatus(error.message)
        return
      }
      setVendor(data as any)
      setStatus('')
    })()
  }, [slug])

  async function placeOrder() {
    if (!vendor) return
    if (!customerName.trim()) return setStatus('Please enter your name.')
    if (!customerPhone.trim()) return setStatus('Please enter your phone/WhatsApp number.')

    setStatus('Placing order…')

    const orderPayload: any = {
      vendor_id: vendor.id,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      order_type: mode,
      meal_slot: mode === 'daily' ? slot : null,
      notes: notes.trim() || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('orders').insert(orderPayload).select('id').single()
    if (error) {
      setStatus(error.message)
      return
    }

    // Create a minimal order item for tracking
    const itemLabel = mode === 'daily' ? `Daily meal (${slot})` : 'Occasion order'
    await supabase.from('order_items').insert({
      order_id: data.id,
      name: itemLabel,
      qty: mode === 'daily' ? qty : 1,
      unit_price_gbp: 0,
    })

    // WhatsApp deep link (optional, keeps vendor workflow natural)
    if (vendor.whatsapp_e164) {
      const msg =
        `New order via Desi Occasions%0A` +
        `Name: ${encodeURIComponent(customerName)}%0A` +
        `Phone: ${encodeURIComponent(customerPhone)}%0A` +
        `${mode === 'daily' ? `Meal: ${slot} (qty ${qty})%0A` : 'Occasion order%0A'}` +
        (notes.trim() ? `Notes: ${encodeURIComponent(notes.trim())}%0A` : '') +
        `Track: ${encodeURIComponent(`${window.location.origin}/order/${data.id}`)}`
      window.open(`https://wa.me/${vendor.whatsapp_e164.replace('+', '')}?text=${msg}`, '_blank')
    }

    router.push(`/order/confirmation/${data.id}`)
  }

  if (!vendor) {
    return (
      <main className="container">
        <section className="card warm">
          <h1 className="h1">Vendor</h1>
          <p className="muted" style={{ marginTop: 8 }}>{status || 'Loading…'}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="container">
      <section className="hero-banner hero-grid">
        <div>
          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <h1 className="h1" style={{ margin: 0 }}>{vendor.name}</h1>
            {vendor.is_verified ? <span className="pill">Verified vendor</span> : null}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            {vendor.city ? `${vendor.city} • ` : ''}WhatsApp-first ordering for daily meals and occasions.
          </p>
          <div className="row" style={{ marginTop: 12 }}>
            <a className="btn primary" href="#order">Place an order</a>
            <a className="btn" href="/vendors">Find more vendors</a>
            {vendor.map_url ? (
              <a className="btn" href={vendor.map_url} target="_blank" rel="noreferrer">Open location</a>
            ) : null}
          </div>
        </div>

        <div className="hero-media">
          <span className="overlay-pill">Multi-faith • Multi-occasion</span>
          {vendor.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.cover_image_url} alt={vendor.name} />
          ) : (
            <OccasionBanner kind={bannerKind} />
          )}
        </div>
      </section>

      {Array.isArray(vendor.gallery_urls) && vendor.gallery_urls.length ? (
        <section className="card" style={{ marginTop: 14 }}>
          <h3 className="h3">Gallery</h3>
          <div className="gallery" style={{ marginTop: 12 }}>
            {vendor.gallery_urls.slice(0, 8).map((u) => (
              <div key={u} className="gimg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {vendor.menu_pdf_url ? (
        <section className="card" style={{ marginTop: 14 }}>
          <h3 className="h3">Menu / brochure</h3>
          <p className="muted" style={{ marginTop: 8 }}>View the vendor’s menu, packages, or brochure.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <a className="btn primary" href={vendor.menu_pdf_url} target="_blank" rel="noreferrer">Open menu / brochure</a>
          </div>
        </section>
      ) : null}

      <section className="card" style={{ marginTop: 14 }}>
        <h3 className="h3">What we support</h3>
        <div className="divider" />
        <div className="grid-2">
          <div>
            <div className="pill">Occasions</div>
            <div className="chips" style={{ marginTop: 10 }}>
              {(vendor.supported_occasions || []).map((x) => (
                <span key={x} className="chip" data-active={true}>{labelOccasion(x)}</span>
              ))}
              {!((vendor.supported_occasions || []).length) ? <span className="muted">Not specified</span> : null}
            </div>
          </div>
          <div>
            <div className="pill">Food preferences</div>
            <div className="chips" style={{ marginTop: 10 }}>
              {(vendor.dietary_tags || []).map((x) => (
                <span key={x} className="chip" data-active={true}>{labelDiet(x)}</span>
              ))}
              {!((vendor.dietary_tags || []).length) ? <span className="muted">Not specified</span> : null}
            </div>
          </div>
        </div>
      </section>

      {Array.isArray(vendor.packages) && vendor.packages.length ? (
        <section className="card" style={{ marginTop: 14 }}>
          <h3 className="h3">Packages</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Common packages for popular occasions. Ask on WhatsApp for customisation.
          </p>
          <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
            {vendor.packages.slice(0, 6).map((p: any, i: number) => (
              <div key={i} className="pkg">
                <p className="pkg-title">{p.title || 'Package'}</p>
                {p.description ? <p className="pkg-sub">{p.description}</p> : null}
                <div className="pkg-meta">
                  {p.price_from ? <span className="pill">From {p.price_from}</span> : null}
                  {p.serves ? <span className="pill">Serves {p.serves}</span> : null}
                  {Array.isArray(p.occasions_keys) && p.occasions_keys.length ? (
                    <span className="pill">{p.occasions_keys.map(labelOccasion).join(', ')}</span>
                  ) : null}
                  {p.occasions_other ? <span className="pill">{String(p.occasions_other)}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card" style={{ marginTop: 14 }} id="order">
        <h2 className="h2">Place an order</h2>
        <p className="muted" style={{ marginTop: 8 }}>
          Create an order to track status. Vendors also receive a WhatsApp message (if enabled).
        </p>

        <div className="divider" />

        <div className="row">
          <button type="button" className={mode === 'daily' ? 'btn primary' : 'btn'} onClick={() => setMode('daily')}>Daily</button>
          <button type="button" className={mode === 'occasion' ? 'btn primary' : 'btn'} onClick={() => setMode('occasion')}>Occasion</button>
        </div>

        {mode === 'daily' ? (
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label className="label">Meal slot</label>
              <select className="select" value={slot} onChange={(e) => setSlot(e.target.value as any)}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Quantity</label>
              <input className="input" type="number" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value || '1', 10))} />
            </div>
          </div>
        ) : null}

        <div className="grid-2" style={{ marginTop: 12 }}>
          <div className="field">
            <label className="label">Your name</label>
            <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="field">
            <label className="label">Phone / WhatsApp</label>
            <input className="input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+44…" />
          </div>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="label">Notes</label>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dietary notes, delivery time, address, etc." />
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn primary" type="button" onClick={placeOrder}>Place order</button>
          {vendor.whatsapp_e164 ? (
            <a className="btn" href={`https://wa.me/${vendor.whatsapp_e164.replace('+', '')}`} target="_blank" rel="noreferrer">Message vendor</a>
          ) : null}
        </div>

        {status ? <p className="muted" style={{ marginTop: 10 }}>{status}</p> : null}
      </section>
    </main>
  )
}
