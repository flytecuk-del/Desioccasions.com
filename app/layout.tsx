import './globals.css'

export const metadata = {
  title: 'Desi Occasions',
  description: 'Every desi occasion, sorted'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <a className="brand" href="/">Desi Occasions</a>
            <nav className="nav">
              <a href="/vendors">Vendors</a>
            <a href="/pricing">Pricing</a>
              <a href="/vendor/dashboard">Vendor Dashboard</a>
              <a href="/account/addresses">Addresses</a>
              <a href="/auth">Sign in</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="container" style={{ paddingTop: 24, paddingBottom: 30, opacity: 0.85 }}>
          <small>© Desi Occasions — Every Indian diaspora occasion, sorted.</small>
        </footer>
      </body>
    </html>
  )
}
