import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Field } from '../../components/Field'

export function LoginPage() {
  const [notice, setNotice] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('Sign-in is not available until the database is connected.')
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <Link className="wordmark" to="/">
          SevaBridge
        </Link>
        <h1>NGO login</h1>
        <p className="form-note">Demo accounts are created in Supabase. There is no public registration.</p>
        <Field label="Email" name="email" type="email" autoComplete="username" required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />
        {notice ? (
          <p className="field-error" role="alert">
            {notice}
          </p>
        ) : null}
        <Button type="submit">Sign in</Button>
      </form>
    </main>
  )
}
