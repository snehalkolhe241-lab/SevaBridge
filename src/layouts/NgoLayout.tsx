import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Megaphone } from 'lucide-react'
import { Button } from '../components/Button'
import { getSupabase } from '../lib/supabase'

export function NgoLayout() {
  const navigate = useNavigate()

  async function signOut() {
    navigate('/')
    await getSupabase().auth.signOut()
  }

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
          <div className="ngo-actions">
            <Link className="btn btn-primary" to="/ngo/campaigns/new">
              New campaign
            </Link>
            <Button variant="secondary" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </header>
        <main id="main" className="wrap page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
