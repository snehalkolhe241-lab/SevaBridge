import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
  error?: string
}

export function Field({ label, name, error, ...props }: Props) {
  const errorId = `${name}-error`
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? (
        <p id={errorId} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
