'use client'

import { useState } from 'react'

const SERVICES = [
  { key: 'caterer', title: 'Catering', desc: 'Daily tiffin and party catering' },
  { key: 'decor', title: 'Decor', desc: 'Mandap, balloons, florals, stage' },
  { key: 'dj', title: 'DJ & Music', desc: 'Music, sound, live entertainment' },
  { key: 'mithai', title: 'Mithai', desc: 'Sweets, gift boxes, festival packs' },
  { key: 'mehndi', title: 'Mehndi', desc: 'Henna artists and beauty services' },
  { key: 'pandit', title: 'Ceremonies', desc: 'Multi-faith services & officiants' }
]

const OCCASIONS = [
  { title: 'Wedding', note: 'Catering · Decor · Music' },
  { title: 'Birthday', note: 'Food · DJ · Decor' },
  { title: 'Festival', note: 'Gift boxes · Catering · Community events' },
  { title: 'Community Night', note: 'Bhajan · Curry night · Movie night' }
]

import { OccIcon } from '@/components/OccIcon'
import { OccasionBanner } from '@/components/OccasionBanner'

export default function Home() {
  const [city, setCity] = useState('')
  const [service, setService] = useState('caterer')

  function go() {
    if (typeof window !== 'undefined') {
      if (city) window.localStorage.setItem('do_city', city)
      if (service) window.localStorage.setItem('do_cat', service)
    }
    window.location.href = '/vendors'
  }

  return (
    <div>
      <section className="hero">
        <h1>Desi celebrations made simple</h1>
        <p>
          Find trusted vendors for every Indian diaspora occasion — food, decor, music, ceremonies, and more.
          Built to work with WhatsApp, and friendly for multi-faith, multi-culture communities.
        </p>

        <div className="hero-grid">
          <div className="searchbar">
            <input className="control" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (e.g., London, Birmingham, Toronto)" />
            <select className="control" value={service} onChange={(e) => setService(e.target.value)}>
              {SERVICES.map(s => <option key={s.key} value={s.key}>{s.title}</option>)}
            </select>
            <button className="btn primary" onClick={go}>Find vendors</button>
          </div>

          <div className="card warm">
            <div style={{ fontWeight: 950, fontSize: 14, marginBottom: 6 }}>Popular this week</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Ladies Night','Boys Night','Curry Night','Movie Night','Bhajan','Eid Dinner','Diwali Party'].map(x => (
                <span key={x} className="pill">{x}</span>
              ))}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 13, opacity: 0.85 }}>
              You can also create a custom occasion name on the event flow.
            </p>
          </div>
        </div>

        <div className="tiles">
          {SERVICES.slice(0,3).map(s => (
            <div key={s.key} className="tile">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <div>
              <b>Select</b>
              <p>Pick your city and vendor category.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div>
              <b>Order</b>
              <p>Daily meals or party orders with clear details.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div>
              <b>Track</b>
              <p>Status updates and links you can share on WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>
      <section style={{ marginTop: 14 }} className="card">
        <h3 className="h3">Multi-faith occasions across Indian communities</h3>
        <p className="muted" style={{ marginTop: 8 }}>
          Discover vendors and services for celebrations, festivals, and community gatherings — across faiths, regions, and cultures.
        </p>
        <div className="occasions" style={{ marginTop: 12 }}>
          <span className="occ-chip"><OccIcon kind="diwali" />Diwali</span>
          <span className="occ-chip"><OccIcon kind="eid" />Eid</span>
          <span className="occ-chip"><OccIcon kind="sikh" />Vaisakhi / Gurpurab</span>
          <span className="occ-chip"><OccIcon kind="christmas" />Christmas</span>
          <span className="occ-chip"><OccIcon kind="jain" />Paryushan</span>
          <span className="occ-chip"><OccIcon kind="buddhist" />Vesak</span>
          <span className="occ-chip"><OccIcon kind="diwali" />Navratri</span>
          <span className="occ-chip"><OccIcon kind="diwali" />Weddings</span>
          <span className="occ-chip"><OccIcon kind="diwali" />Community dinners</span>
        </div>
      </section>


      <section style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <h3 style={{ margin: '0 0 8px' }}>Occasion packages</h3>
          <p style={{ margin: '0 0 12px', opacity: 0.85 }}>From small home gatherings to big celebrations.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {OCCASIONS.map(o => (
              <div key={o.title} className="tile">
                <h3>{o.title}</h3>
                <p>{o.note}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ margin: '0 0 8px' }}>For vendors</h3>
          <p style={{ margin: '0 0 12px', opacity: 0.85 }}>
            Take daily breakfast/lunch/dinner orders and party bookings — with capacity limits, cutoffs, and tracking.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="btn primary" href="/vendor/dashboard">Vendor dashboard</a>
            <a className="btn ghost" href="/vendor/demo-kitchen">View demo storefront</a>
            <a className="btn" href="/vendors">Browse vendors</a>
          </div>
          <div style={{ marginTop: 12, opacity: 0.85, fontSize: 13 }}>
            Tip: Add a Google Maps link to help customers navigate with their preferred map apps.
          </div>
        </div>
      </section>
    </div>
  )
}
