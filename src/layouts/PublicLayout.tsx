import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const discover = [
  ['Campaigns', '/campaigns'],
  ['Education', '/campaigns?category=education'],
  ['Food & Essentials', '/campaigns?category=essentials'],
  ['Healthcare', '/campaigns?category=healthcare'],
  ['Community Development', '/campaigns?category=community'],
] as const

function scrollToId(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) return
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

function SectionLink({
  to,
  children,
  onNavigate,
}: {
  to: string
  children: ReactNode
  onNavigate?: () => void
}) {
  const location = useLocation()
  const hash = to.slice(to.indexOf('#'))

  function onClick() {
    onNavigate?.()
  }

  if (location.pathname === '/') {
    return (
      <a href={hash} onClick={onClick}>
        {children}
      </a>
    )
  }

  return (
    <Link to={to} onClick={onClick}>
      {children}
    </Link>
  )
}

function Mark() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#145c45" />
      <path
        d="M7 21.5h18M9 21.5v-5.2a7 7 0 0 1 14 0v5.2M16 12.2v9.3"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PublicLayout() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    let cancelled = false
    const go = () => {
      if (!cancelled) scrollToId(location.hash)
    }
    const frame = window.requestAnimationFrame(() => window.requestAnimationFrame(go))
    const timer = window.setTimeout(go, 80)
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [location.pathname, location.hash])

  return (
    <div className="public-shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={open ? 'public-header is-open' : 'public-header'}>
        <div className="wrap public-header-inner">
          <Link className="brand" to="/" onClick={close}>
            <Mark />
            SevaBridge
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="public-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
          <nav id="public-nav" className="public-nav" aria-label="Primary">
            <NavLink to="/campaigns" onClick={close}>
              Explore Campaigns
            </NavLink>
            <SectionLink to="/#causes" onNavigate={close}>
              Causes
            </SectionLink>
            <SectionLink to="/#how-it-works" onNavigate={close}>
              How It Works
            </SectionLink>
            <SectionLink to="/#for-ngos" onNavigate={close}>
              For NGOs
            </SectionLink>
            <NavLink className="btn btn-secondary" to="/ngo/login" onClick={close}>
              NGO Login
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="public-footer site-footer">
        <div className="wrap site-footer-grid">
          <div>
            <Link className="brand" to="/" onClick={close}>
              <Mark />
              SevaBridge
            </Link>
            <p className="site-footer-mission">
              SevaBridge helps community organisations publish what they need and record pledges that are handed
              over offline.
            </p>
          </div>
          <nav aria-label="Discover">
            <h2>Discover</h2>
            {discover.map(([label, href]) => (
              <Link key={href} to={href}>
                {label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Platform">
            <h2>Platform</h2>
            <SectionLink to="/#how-it-works">How It Works</SectionLink>
            <SectionLink to="/#for-ngos">For NGOs</SectionLink>
            <Link to="/ngo/login">NGO Login</Link>
          </nav>
        </div>
        <div className="wrap site-footer-base">
          <p>© 2026 SevaBridge. A student demonstration. Not a payment service.</p>
        </div>
      </footer>
    </div>
  )
}
