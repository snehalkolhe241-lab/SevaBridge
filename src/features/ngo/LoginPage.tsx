import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Field } from '../../components/Field'
import { getSupabase } from '../../lib/supabase'

function nextPath(from: unknown) {
  return typeof from === 'string' && from.startsWith('/ngo/') && from !== '/ngo/login' ? from : '/ngo/dashboard'
}

function loginMessage(message: string) {
  if (/invalid login/i.test(message)) return 'Email or password is incorrect.'
  if (/not confirmed/i.test(message)) return 'Confirm the email address before signing in.'
  return 'Sign-in failed. Check the email and password.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    if (!email.trim() || !password) {
      setNotice('Enter your email and password.')
      return
    }
    setPending(true)
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setNotice(loginMessage(error.message))
        return
      }
      const from = (location.state as { from?: string } | null)?.from
      navigate(nextPath(from), { replace: true })
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : 'Sign-in failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={onSubmit} noValidate>
        <Link className="wordmark" to="/">
          SevaBridge
        </Link>
        <h1>NGO login</h1>
        <p className="form-note">This sign-in is for NGO accounts. There is no public registration.</p>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {notice ? (
          <p className="field-error" role="alert">
            {notice}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  )
}
