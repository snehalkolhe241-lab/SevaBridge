import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { getSupabase } from '../../lib/supabase'

export function RequireAuth() {
  const location = useLocation()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    let unsubscribe = () => {}
    try {
      const { data } = getSupabase().auth.onAuthStateChange((_event, next) => {
        setSession(next)
      })
      unsubscribe = () => data.subscription.unsubscribe()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign-in is unavailable.')
      setSession(null)
    }
    return unsubscribe
  }, [])

  if (error) {
    return (
      <p className="wrap page" role="alert">
        {error}
      </p>
    )
  }
  if (session === undefined) {
    return (
      <p className="wrap page" role="status">
        Checking session…
      </p>
    )
  }
  if (!session) {
    return <Navigate to="/ngo/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
