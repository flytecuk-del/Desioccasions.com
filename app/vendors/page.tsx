'use client'

import { useEffect, useMemo, useState } from 'react'
import { OccasionBanner } from '@/components/OccasionBanner'
import { labelDiet, labelOccasion } from '@/lib/labels'
import { supabaseBrowser } from '@/lib/supabaseClient'

type Vendor = {
  id: string
  name: string
  slug: string
  city: string
  categories: string[]
  whatsapp_e164: string
  map_url: string | null
  is_featured: boolean | null
  cover_image_url: string | null
  is_verified: boolean | null
  supported_occasions: string[] | null
  dietary_tags: string[] | null
}

const CATS = [
  { key: 'all', label: 'All' },
  { key: 'caterer', label: 'Catering' },
  { key: 'decor', label: 'Decor' },
  { key: 'dj', label: 'DJ & Music' },
  { key: 'mithai', label: 'Mithai' },
  { key: 'mehndi', label: 'Mehndi' },
  { key: 'pandit', label: 'Ceremonies' }
]

export default function Vendors() {
  const supabase = supabaseBrowser()
  const [city, setCity] = useState('')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [occFilter, setOccFilter] = useState<string>('all')
  const [dietFilter, setDietFilter] = useState<string>('all')
  const [vendors, setVendors] = useState<Vendor[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const c = window.localStorage.getItem('do_city')
    const k = window.localStorage.getItem('do_cat')
    if (c) setCity(c)
    if (k) setCat(k)
  }, [])

  useEffect(() => {
    ;(async () => {
      const res = await supabase
        .from('vendors')
        .select('id,name,slug,city,categories,whatsapp_e164,map_url,is_featured,cover_image_url,is_verified,supported_occasions,dietary_tags')
        .order('is_featured', { ascending: false })
        .order('name')
      if (!res.error) setVendors((res.data || []) as any)
    })()
  }, [supabase])

  
  const bannerKind = useMemo(() => {
    if (cat === 'decor') return 'wedding'
    if (cat === 'caterer') return 'diwali'
    if (cat === 'mithai') return 'diwali'
    if (cat === 'pandit') return 'navratri'
    if (cat === 'dj') return 'wedding'
    if (city.toLowerCase().includes('birmingham')) return 'eid'
    return 'diwali'
  }, [cat, city])

const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (city && v.city?.toLowerCase() !== city.toLowerCase()) return false
      if (cat !== 'all' && !(v.categories || []).includes(cat)) return false
      if (occFilter !== 'all' && !((v.supported_occasions || []).includes(occFilter))) return false
      if (dietFilter !== 'all' && !((v.dietary_tags || []).includes(dietFilter))) return false
      if (q && !(v.name.toLowerCase().includes(q.toLowerCase()))) return false
      return true
    })
  }, [vendors, city, cat, q])

  return (
    <div>
      <div className="card warm" style={{ marginTop: 0 }}>
        <h1 style={{ margin: 0 }}>Top vendors in your city</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.85 }}>
          Browse by city and category. View details, then message vendors on WhatsApp.
        </p>

        <div style={{ marginTop: 14 }}>
          <div className="searchbar" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <input
              className="control"
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
                localStorage.setItem('do_city', e.target.value)
              }}
              placeholder="City (e.g., London)"
            />
            <input className="control" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vendor name" />
            <select
              className="control"
              value={cat}
              onChange={(e) => {
                setCat(e.target.value)
                localStorage.setItem('do_cat', e.target.value)
              }}
            >
              {CATS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {CATS.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setCat(c.key)
                  localStorage.setItem('do_cat', c.key)
                }}
                className="pill"
                style={{
                  cursor: 'pointer',
                  background: cat === c.key ? 'rgba(122,30,58,.10)' : '#fff',
                  borderColor: cat === c.key ? 'rgba(122,30,58,.25)' : 'var(--do-border-strong)'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {filtered.map((v) => (
          <div key={v.id} className="card">
            <div style={{ display: 'flex', gap: 14, alignItems: 'stretch', flexWrap: 'wrap' }}>
              <div style={thumb(v)} aria-hidden />
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 950, fontSize: 18 }}>{v.name}</div>
                  {v.is_featured && <span className="badge">Featured</span>}
                  <span className="pill">{v.city}</span>
                </div>
                <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
                  {(v.categories || []).length ? (v.categories || []).join(' · ') : 'Vendor'}
                </div>
                {v.map_url && (
                  <div style={{ marginTop: 6, fontSize: 13 }}>
                    <a href={v.map_url} target="_blank" rel="noreferrer">
                      Open location
                    </a>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <a href={`/vendor/${v.slug}`} className="btn ghost">
                  View
                </a>
                <a
                  href={`https://wa.me/${(v.whatsapp_e164 || '').replace('+', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn primary"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card">
            <p style={{ margin: 0, opacity: 0.85 }}>No vendors found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function thumb(v: Vendor): React.CSSProperties {
  const cat = (v.categories || [])[0] || 'vendor'
  const map: Record<string, string> = {
    caterer: 'linear-gradient(135deg, rgba(244,162,97,.35), rgba(122,30,58,.20))',
    decor: 'linear-gradient(135deg, rgba(122,30,58,.25), rgba(244,162,97,.18))',
    dj: 'linear-gradient(135deg, rgba(31,41,55,.18), rgba(122,30,58,.20))',
    mithai: 'linear-gradient(135deg, rgba(244,162,97,.35), rgba(255,248,242,.2))',
    mehndi: 'linear-gradient(135deg, rgba(122,30,58,.22), rgba(31,41,55,.12))',
    pandit: 'linear-gradient(135deg, rgba(244,162,97,.26), rgba(122,30,58,.16))'
  }
  return {
    width: 160,
    minHeight: 96,
    borderRadius: 14,
    border: '1px solid var(--do-border)',
    background: map[cat] || map.caterer
  }
}
