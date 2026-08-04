import React from 'react'

export default function TextInput({
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

  return (
    <div className={['field', error ? 'has-error' : '', className].filter(Boolean).join(' ')}>
      {label && <label className="field-label" htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className="field-control"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        {...rest}
      />
      {error && <span id={errorId} className="field-error" role="alert">{error}</span>}
      {!error && helperText && <span id={helperId} className="field-helper">{helperText}</span>}
    </div>
  )
}
