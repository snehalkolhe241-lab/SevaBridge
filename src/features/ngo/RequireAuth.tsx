import { Navigate, Outlet, useLocation } from 'react-router-dom'

function hasSession(): boolean {
  return false
}

/** Phase 1 stub: there is no session yet, so every protected route redirects. */
export function RequireAuth() {
  const location = useLocation()
  if (!hasSession()) {
    return <Navigate to="/ngo/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
