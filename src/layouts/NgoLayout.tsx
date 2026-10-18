import { Link, NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Megaphone } from 'lucide-react'

export function NgoLayout() {
  return (
    <div className="ngo-shell">
      <aside className="ngo-sidebar">
        <Link className="wordmark" to="/ngo/dashboard">
          SevaBridge
        </Link>
        <nav className="ngo-nav" aria-label="NGO">
          <NavLink to="/ngo/dashboard">
            <LayoutDashboard aria-hidden="true" size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/ngo/campaigns">
            <Megaphone aria-hidden="true" size={18} />
            Campaigns
          </NavLink>
        </nav>
      </aside>
      <div className="ngo-main">
        <header className="ngo-topbar">
          <p className="wordmark">Campaign console</p>
          <Link className="btn btn-primary" to="/ngo/campaigns/new">
            New campaign
          </Link>
        </header>
        <main id="main" className="wrap page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
