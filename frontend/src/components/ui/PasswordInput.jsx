import React from 'react'

export default function PasswordInput({
  label,
  id,
  error,
  helperText,
  className = '',
  ...rest
}) {
  const autoId = React.useId()
  const inputId = id || autoId
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText ? `${inputId}-helper` : undefined
  const [revealed, setRevealed] = React.useState(false)

  return (
    <div className={['field', error ? 'has-error' : '', className].filter(Boolean).join(' ')}>
      {label && <label className="field-label" htmlFor={inputId}>{label}</label>}
      <div className="password-field-row">
        <input
          id={inputId}
          type={revealed ? 'text' : 'password'}
          className="field-control"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={revealed ? 'Hide password' : 'Show password'}
          aria-pressed={revealed}
          onClick={() => setRevealed((v) => !v)}
        >
          {revealed ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <span id={errorId} className="field-error" role="alert">{error}</span>}
      {!error && helperText && <span id={helperId} className="field-helper">{helperText}</span>}
    </div>
  )
}
