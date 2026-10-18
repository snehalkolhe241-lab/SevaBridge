import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export function PublicLayout() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={open ? 'public-header is-open' : 'public-header'}>
        <div className="wrap public-header-inner">
          <Link className="wordmark" to="/" onClick={close}>
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
            <a href="/#how-it-works" onClick={close}>
              How It Works
            </a>
            <NavLink to="/ngo/login" onClick={close}>
              NGO Login
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="wrap public-footer-inner">
          <p>SevaBridge helps NGOs publish needs and record pledges that are fulfilled offline.</p>
          <nav className="footer-nav" aria-label="Footer">
            <Link to="/campaigns">Campaigns</Link>
            <Link to="/ngo/login">NGO Login</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
