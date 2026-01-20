'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { normalizeE164, safeText } from '@/lib/format'

type Vendor = {
  id: string
  slug: string
  name: string
  city: string
  whatsapp_e164: string
  map_url: string | null
  breakfast_capacity: number | null
  lunch_capacity: number | null
  dinner_capacity: number | null
  breakfast_cutoff: string | null
  lunch_cutoff: string | null
  dinner_cutoff: string | null
  is_featured: boolean | null
  categories: string[] | null
  cover_image_url: string | null
  gallery_urls: string[] | null
  menu_pdf_url: string | null
  is_verified: boolean | null
  supported_occasions: string[] | null
  dietary_tags: string[] | null
  packages: any[] | null
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

export default function VendorDashboard() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [status, setStatus] = useState<string | null>(null)

  // simple form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [city, setCity] = useState('')
  const [wa, setWa] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [breakfastCap, setBreakfastCap] = useState('')
  const [lunchCap, setLunchCap] = useState('')
  const [dinnerCap, setDinnerCap] = useState('')
  const [breakfastCutoff, setBreakfastCutoff] = useState('')
  const [lunchCutoff, setLunchCutoff] = useState('')
  const [dinnerCutoff, setDinnerCutoff] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [menuPdfUrl, setMenuPdfUrl] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [supportedOccasions, setSupportedOccasions] = useState<string[]>([])
  const [dietaryTags, setDietaryTags] = useState<string[]>([])
  const [packages, setPackages] = useState<any[]>([])

  const [usedToday, setUsedToday] = useState<{ breakfast:number; lunch:number; dinner:number }>({ breakfast:0, lunch:0, dinner:0 })

  const [kind, setKind] = useState<'daily' | 'occasion'>('daily')
  const [meal, setMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [veg, setVeg] = useState<'veg' | 'nonveg' | 'na'>('veg')

  const [images, setImages] = useState<FileList | null>(null)

  useEffect(() => {
    ;(async () => {
      // Vendor association is simplified: first vendor row for now.
      // In production: vendors.user_id == session.user.id.
      const v = await supabase.from('vendors').select('*').limit(1).maybeSingle()
      if (v.data) {
        setVendor(v.data)
        setName(v.data.name)
        setSlug(v.data.slug)
        setCity(v.data.city)
        setWa(v.data.whatsapp_e164)
        setMapUrl(v.data.map_url || '')
        setBreakfastCap(v.data.breakfast_capacity ? String(v.data.breakfast_capacity) : '')
        setLunchCap(v.data.lunch_capacity ? String(v.data.lunch_capacity) : '')
        setDinnerCap(v.data.dinner_capacity ? String(v.data.dinner_capacity) : '')
        await loadCatalog(v.data.id)
      }
    })()
  }, [supabase])

  async function loadCatalog(vendorId: string) {
    const c = await supabase.from('vendor_catalog').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: true })
    if (c.error) {
      setStatus(c.error.message)
      return
    }
    setCatalog(c.data)
  }

  async function saveVendor() {
    setStatus(null)
    const payload = {
      name: safeText(name, 60),
      slug: safeText(slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), 50),
      city: safeText(city, 40),
      whatsapp_e164: normalizeE164(wa),
      map_url: mapUrl ? safeText(mapUrl, 240) : null
    }

    if (vendor) {
      const u = await supabase.from('vendors').update(payload).eq('id', vendor.id).select('*').single()
      if (u.error) return setStatus(u.error.message)
      setVendor(u.data)
      setStatus('Vendor profile updated.')
      return
    }

    const i = await supabase.from('vendors').insert(payload).select('*').single()
    if (i.error) return setStatus(i.error.message)
    setVendor(i.data)
    setStatus('Vendor profile created.')
  }

  async function addCatalogItem() {
    setStatus(null)
    if (!vendor) return setStatus('Create vendor profile first.')

    const priceNum = price.trim() ? Number(price) : null
    const payload = {
      vendor_id: vendor.id,
      kind,
      meal_slot: kind === 'daily' ? meal : null,
      title: safeText(title, 80),
      description: desc ? safeText(desc, 180) : null,
      price_gbp: priceNum,
      is_veg: veg === 'na' ? null : veg === 'veg'
    }

    const ins = await supabase.from('vendor_catalog').insert(payload).select('*').single()
    if (ins.error) return setStatus(ins.error.message)

    setCatalog((c) => [...c, ins.data])
    setTitle('')
    setDesc('')
    setPrice('')
    setVeg('veg')
    setStatus('Catalog item added.')
  }

  async function uploadGallery() {
    setStatus(null)
    if (!vendor) return setStatus('Create vendor profile first.')
    if (!images || images.length === 0) return setStatus('Select images to upload.')

    // Requires Supabase Storage bucket "vendor-gallery".
    const uploaded: string[] = []
    for (const file of Array.from(images)) {
      const path = `${vendor.id}/${Date.now()}-${file.name}`
      const up = await supabase.storage.from('vendor-gallery').upload(path, file, { upsert: false })
      if (up.error) return setStatus(up.error.message)

      const pub = supabase.storage.from('vendor-gallery').getPublicUrl(path)
      uploaded.push(pub.data.publicUrl)
    }

    await supabase.from('vendor_gallery').insert(uploaded.map((url) => ({ vendor_id: vendor.id, url })))
    setStatus(`Uploaded ${uploaded.length} image(s).`)
  }

  
  async function uploadMedia(file: File, kind: 'cover' | 'gallery') {
    if (!vendor) return null
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${vendor.id}/${kind}-${Date.now()}-${safeName}`
    const up = await supabase.storage.from('vendor-media').upload(path, file, { upsert: false })
    if (up.error) {
      setStatus(up.error.message || 'Upload failed')
      return null
    }
    const pub = supabase.storage.from('vendor-media').getPublicUrl(path)
    return pub.data.publicUrl
  }

return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card">
        <h2 className="h2">Vendor Dashboard</h2>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          Manage your storefront: gallery, daily meals (breakfast/lunch/dinner), and occasion packages.
        </p>

        <div style={grid}>
          <div>
            <label className="label">Business name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Slug (URL)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="raj-kitchen" className="input" />
          </div>
          <div>
            <label className="label">City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="London" className="input" />
          </div>
          <div>
            <label className="label">WhatsApp (E.164)</label>
            <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="+4479..." className="input" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Google Maps link</label>
            <input value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." className="input" />
          </div>
        </div>
            <div style={{ marginTop: 12 }}>
              <h3 className="h3">Daily order capacity (optional)</h3>
              <p style={{ margin: '0 0 10px', opacity: 0.8, fontSize: 13 }}>
                Limit how many daily orders you accept per meal slot, per day. Leave blank for unlimited.
              </p>
              <div className="grid-3">
                <div>
                  <label className="label">Breakfast</label>
                  <input value={breakfastCap} onChange={(e) => setBreakfastCap(e.target.value)} placeholder="e.g., 20" className="input" />
                </div>
                <div>
                  <label className="label">Lunch</label>
                  <input value={lunchCap} onChange={(e) => setLunchCap(e.target.value)} placeholder="e.g., 30" className="input" />
                </div>
                <div>
                  <label className="label">Dinner</label>
                  <input value={dinnerCap} onChange={(e) => setDinnerCap(e.target.value)} placeholder="e.g., 15" className="input" />
                </div>
              </div>
            </div>


        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          
          <div className="divider" />

          <div>
            <h3 className="h3">Media & photos</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              Add food/service photos so organisers can choose confidently. Include images suitable for multi-faith celebrations.
            </p>

            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="card" style={{ background: 'rgba(255,255,255,.86)' }}>
                <div className="pill">Cover image</div>
                <div className="hero-media" style={{ minHeight: 180, marginTop: 10 }}>
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="Cover" />
                  ) : (
                    <span className="overlay-pill">Add a cover photo</span>
                  )}
                </div>

                <div style={{ marginTop: 12 }} className="row">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const url = await uploadMedia(file, 'cover')
                      if (url) setCoverUrl(url)
                    }}
                  />
                  {coverUrl ? (
                    <button className="btn" type="button" onClick={() => setCoverUrl('')}>Remove</button>
                  ) : null}
                </div>
                <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
                  Recommended: 1200×600 or larger.
                </p>
              </div>

              <div className="card" style={{ background: 'rgba(255,255,255,.86)' }}>
                <div className="pill">Gallery</div>
                <div className="gallery" style={{ marginTop: 12 }}>
                  {galleryUrls.slice(0, 8).map((u) => (
                    <div key={u} className="gimg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt="" />
                    </div>
                  ))}
                  {galleryUrls.length === 0 ? (
                    <div className="gimg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="muted">Add photos</span>
                    </div>
                  ) : null}
                </div>

                <div style={{ marginTop: 12 }} className="row">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || [])
                      if (!files.length) return
                      for (const f of files.slice(0, 6)) {
                        const url = await uploadMedia(f, 'gallery')
                        if (url) setGalleryUrls((prev) => [url, ...prev])
                      }
                    }}
                  />
                  {galleryUrls.length ? (
                    <button className="btn" type="button" onClick={() => setGalleryUrls([])}>Clear</button>
                  ) : null}
                </div>
                <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
                  Add 3–8 photos: food, setups, decor, menus, previous events.
                </p>

                <div className="divider" />

                <div>
                  <div className="pill">Menu / brochure (PDF)</div>
                  <p className="muted" style={{ marginTop: 8 }}>
                    Optional but recommended for caterers. Upload a menu, packages, or brochure.
                  </p>
                  <div className="row" style={{ marginTop: 10 }}>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = await uploadMedia(file as any, 'menu' as any)
                        if (url) setMenuPdfUrl(url)
                      }}
                    />
                    {menuPdfUrl ? (
                      <>
                        <a className="btn" href={menuPdfUrl} target="_blank" rel="noreferrer">Open PDF</a>
                        <button className="btn" type="button" onClick={() => setMenuPdfUrl('')}>Remove</button>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="divider" />

                <div>
                  <div className="pill">Verification</div>
                  <p className="muted" style={{ marginTop: 8 }}>
                    Verified vendors have better conversion. Recommended: cover image + 3+ photos + optional menu.
                  </p>
                  <div className="row" style={{ marginTop: 10, alignItems: 'center' }}>
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isVerified}
                        onChange={(e) => setIsVerified(e.target.checked)}
                      />
                      Mark as verified
                    </label>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        const auto = !!coverUrl && galleryUrls.length >= 3
                        setIsVerified(auto)
                      }}
                    >
                      Auto-verify from photos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div>
            <h3 className="h3">Occasions & food preferences</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              These appear as filters for customers. Choose what you can support.
            </p>

            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="card" style={{ background: 'rgba(255,255,255,.86)' }}>
                <div className="pill">Occasions</div>
                <div className="chips" style={{ marginTop: 12 }}>
                  {['diwali','eid','navratri','ramadan','vaisakhi','paryushan','vesak','wedding','engagement','mehndi','sangeet','housewarming','community','bhajan','christmas','newyear'].map((k) => (
                    <span
                      key={k}
                      className="chip"
                      data-active={supportedOccasions.includes(k)}
                      onClick={() => setSupportedOccasions(prev => prev.includes(k) ? prev.filter(x => x !== k) : [k, ...prev])}
                    >
                      {k}
                    </span>
                  ))}
                </div>
                <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>Tip: select 3–8 to start.</p>
              </div>

              <div className="card" style={{ background: 'rgba(255,255,255,.86)' }}>
                <div className="pill">Food preferences</div>
                <div className="chips" style={{ marginTop: 12 }}>
                  {['veg','nonveg','halal','hindu','jain','sattvic','vegan','glutenfree'].map((k) => (
                    <span
                      key={k}
                      className="chip"
                      data-active={dietaryTags.includes(k)}
                      onClick={() => setDietaryTags(prev => prev.includes(k) ? prev.filter(x => x !== k) : [k, ...prev])}
                    >
                      {k}
                    </span>
                  ))}
                </div>
                <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>Use “halal”, “jain”, “sattvic” if applicable.</p>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div>
            <h3 className="h3">Packages</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              Add a few popular packages (wedding catering, iftar box, decor setup). Customers can view these before messaging you.
            </p>

            <div className="card" style={{ background: 'rgba(255,255,255,.86)', marginTop: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="pill">Package list</div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setPackages(prev => [{ title: '', description: '', price_from: '', serves: '', occasions_keys: [], occasions_other: '' }, ...prev])}
                >
                  Add package
                </button>
              </div>

              <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                {packages.map((p, idx) => (
                  <div key={idx} className="pkg">
                    <div className="grid-2">
                      <div className="field">
                        <label className="label">Title</label>
                        <input className="input" value={p.title || ''} onChange={(e) => setPackages(prev => prev.map((x, i) => i===idx ? { ...x, title: e.target.value } : x))} placeholder="Wedding catering package" />
                      </div>
                      <div className="field">
                        <label className="label">Price from</label>
                        <input className="input" value={p.price_from || ''} onChange={(e) => setPackages(prev => prev.map((x, i) => i===idx ? { ...x, price_from: e.target.value } : x))} placeholder="£250 / $300" />
                      </div>
                    </div>

                    <div className="grid-2" style={{ marginTop: 10 }}>
                      <div className="field">
                        <label className="label">Serves</label>
                        <input className="input" value={p.serves || ''} onChange={(e) => setPackages(prev => prev.map((x, i) => i===idx ? { ...x, serves: e.target.value } : x))} placeholder="20–30" />
                      </div>
                      <div className="field">
                        <label className="label">Occasions</label>
                        <div className="chips" style={{ marginTop: 8 }}>
                          {['diwali','eid','navratri','ramadan','vaisakhi','paryushan','vesak','wedding','engagement','mehndi','sangeet','housewarming','community','bhajan','christmas','newyear'].map((k) => {
                            const selected = Array.isArray(p.occasions_keys) ? p.occasions_keys.includes(k) : false
                            return (
                              <span
                                key={k}
                                className="chip"
                                data-active={selected}
                                onClick={() => setPackages(prev => prev.map((x, i) => {
                                  if (i !== idx) return x
                                  const keys = Array.isArray(x.occasions_keys) ? x.occasions_keys : []
                                  return selected
                                    ? { ...x, occasions_keys: keys.filter((t: string) => t !== k) }
                                    : { ...x, occasions_keys: [k, ...keys] }
                                }))}
                              >
                                {labelOccasion(k)}
                              </span>
                            )
                          })}
                        </div>
                        <div className="field" style={{ marginTop: 10 }}>
                          <label className="label">Other (optional)</label>
                          <input
                            className="input"
                            value={p.occasions_other || ''}
                            onChange={(e) => setPackages(prev => prev.map((x, i) => i===idx ? { ...x, occasions_other: e.target.value } : x))}
                            placeholder="e.g., Anniversary, Baby shower"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="field" style={{ marginTop: 10 }}>
                      <label className="label">Description</label>
                      <textarea className="textarea" value={p.description || ''} onChange={(e) => setPackages(prev => prev.map((x, i) => i===idx ? { ...x, description: e.target.value } : x))} placeholder="Includes starters, mains, desserts. Setup + serving available." />
                    </div>

                    <div className="row" style={{ marginTop: 10 }}>
                      <button type="button" className="btn" onClick={() => setPackages(prev => prev.filter((_, i) => i !== idx))}>Remove</button>
                    </div>
                  </div>
                ))}
                {packages.length === 0 ? <p className="muted" style={{ margin: 0 }}>No packages yet. Add 2–4 to start.</p> : null}
              </div>
            </div>
          </div>

          <div className="divider" />
<div className="divider" />
<button onClick={saveVendor} style={primaryBtn}>{vendor ? 'Save changes' : 'Create vendor profile'}</button>
          {vendor?.slug && (
            <a href={`/vendor/${vendor.slug}`} style={secondaryBtn}>Open storefront</a>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="h3">Gallery upload</h3>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          Upload food/setup photos. Requires Supabase Storage bucket: <b>vendor-gallery</b>.
        </p>
        <input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files)} />
        <div style={{ marginTop: 10 }}>
          <button onClick={uploadGallery} style={primaryBtn}>Upload selected images</button>
        </div>
      </div>

      <div className="card">
        <h3 className="h3">Add menu / package</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setKind('daily')} style={chip(kind === 'daily')}>Daily</button>
          <button onClick={() => setKind('occasion')} style={chip(kind === 'occasion')}>Occasion</button>
          {kind === 'daily' && (
            <>
              <button onClick={() => setMeal('breakfast')} style={chip2(meal === 'breakfast')}>Breakfast</button>
              <button onClick={() => setMeal('lunch')} style={chip2(meal === 'lunch')}>Lunch</button>
              <button onClick={() => setMeal('dinner')} style={chip2(meal === 'dinner')}>Dinner</button>
            </>
          )}
        </div>

        <div style={{ ...grid, marginTop: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Paneer Tikka / Diwali Catering Package" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} className="input" placeholder="Serves 10–15 • Includes starters + mains" />
          </div>
          <div>
            <label className="label">Price (GBP)</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} className="input" placeholder="12" />
          </div>
          <div>
            <label className="label">Veg</label>
            <select value={veg} onChange={(e) => setVeg(e.target.value as any)} style={input as any}>
              <option value="veg">Veg</option>
              <option value="nonveg">Non-veg</option>
              <option value="na">N/A</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={addCatalogItem} style={primaryBtn}>Add</button>
        </div>

        <div style={{ marginTop: 14 }}>
          <h4 style={{ margin: '0 0 8px' }}>Current items ({catalog.length})</h4>
          <div style={{ display: 'grid', gap: 8 }}>
            {catalog.map((c) => (
              <div key={c.id} style={row}>
                <div>
                  <div style={{ fontWeight: 900 }}>{c.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    {c.kind}{c.kind === 'daily' ? ` • ${c.meal_slot}` : ''}
                    {c.price_gbp != null ? ` • £${c.price_gbp}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {status && <div style={notice}>{status}</div>}
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(31,41,55,.12)',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 18px 40px rgba(31,41,55,.08)'
}
const grid: React.CSSProperties = { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }
const label: React.CSSProperties = { display: 'block', fontWeight: 800, fontSize: 12, opacity: 0.75, marginBottom: 6 }
const input: React.CSSProperties = { width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(31,41,55,.18)' }
const primaryBtn: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 999,
  border: 'none',
  background: '#7A1E3A',
  color: '#FFF8F2',
  fontWeight: 900,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block'
}
const secondaryBtn: React.CSSProperties = { ...primaryBtn, background: 'rgba(122,30,58,.10)', color: '#7A1E3A', border: '1px solid rgba(122,30,58,.25)' }
const row: React.CSSProperties = { padding: 12, borderRadius: 14, border: '1px solid rgba(31,41,55,.10)' }
const notice: React.CSSProperties = { padding: 12, borderRadius: 14, border: '1px solid rgba(122,30,58,.25)', background: 'rgba(122,30,58,.08)' }
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