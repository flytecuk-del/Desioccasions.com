export default function Pricing() {
  return (
    <main className="container">
      <section className="card warm">
        <h1 className="h1">Pricing for vendors</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          Desi Occasions is free to use. Vendor Pro is for vendors who want less chaos and more repeat business — without changing how customers already order.
        </p>
        <div className="divider" />
        <div className="row">
          <a className="btn" href="/vendors">Browse vendors</a>
          <a className="btn primary" href="/auth">Vendor sign in</a>
        </div>
      </section>

      <section style={{ marginTop: 14 }} className="grid-2">
        <div className="card">
          <div className="pill">Free</div>
          <h2 className="h2" style={{ marginTop: 10 }}>£0 / month</h2>
          <p className="muted" style={{ marginTop: 8 }}>Best for occasional orders.</p>
          <div className="divider" />
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Vendor page</li>
            <li>Receive orders</li>
            <li>WhatsApp order alerts</li>
            <li>Basic order tracking</li>
          </ul>
          <div className="divider" />
          <p className="muted" style={{ margin: 0 }}>Limits: no cutoffs, no capacity limits, no reorders.</p>
        </div>

        <div className="card">
          <div className="pill">Vendor Pro</div>
          <h2 className="h2" style={{ marginTop: 10 }}>£25 / month</h2>
          <p className="muted" style={{ marginTop: 8 }}>Best for daily meals and active caterers.</p>
          <div className="divider" />
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Daily order limits (capacity per meal slot)</li>
            <li>Cutoff times (auto-close ordering)</li>
            <li>Today&apos;s Orders dashboard</li>
            <li>One-tap reorders</li>
            <li>Subscriptions (weekly/monthly)</li>
            <li>Festival eligibility + priority support</li>
          </ul>
          <div className="divider" />
          <p className="muted" style={{ margin: 0 }}>
            No contracts. Cancel anytime. If you want Pro enabled, message us on WhatsApp.
          </p>
          <div style={{ marginTop: 12 }} className="row">
            <a className="btn primary" href="https://wa.me/447000000000" target="_blank" rel="noreferrer">Enable Vendor Pro on WhatsApp</a>
            <a className="btn" href="/vendors">See vendors</a>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 14 }} className="card">
        <h3 className="h3">Featured vendors</h3>
        <p className="muted" style={{ marginTop: 8 }}>
          Appear at the top when organisers are searching in your city.
        </p>
        <div className="row" style={{ marginTop: 10 }}>
          <span className="pill">£49 / month (city)</span>
          <span className="pill">£99–£199 per festival week</span>
        </div>
      </section>

      <section style={{ marginTop: 14 }} className="card">
        <h3 className="h3">Payments & deposits</h3>
        <p className="muted" style={{ marginTop: 8 }}>
          We only charge a small service fee when we process payments. You can still accept orders without payments.
        </p>
      </section>
    </main>
  )
}
