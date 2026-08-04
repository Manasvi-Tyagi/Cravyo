import React from 'react'

export default function TextArea({
  label,
  id,
  error,
  helperText,
  maxLength,
  value = '',
  className = '',
  ...rest
}) {
  const autoId = React.useId()
  const inputId = id || autoId
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText ? `${inputId}-helper` : undefined
  const nearLimit = maxLength && value.length >= maxLength - 50
  const atLimit = maxLength && value.length >= maxLength

  return (
    <div className={['field', error ? 'has-error' : '', className].filter(Boolean).join(' ')}>
      {label && <label className="field-label" htmlFor={inputId}>{label}</label>}
      <textarea
        id={inputId}
        className="field-control"
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        {...rest}
      />
      {maxLength && nearLimit && (
        <span className={['field-counter', atLimit ? 'at-limit' : 'near-limit'].join(' ')} aria-live="polite">
          {value.length}/{maxLength}
        </span>
      )}
      {error && <span id={errorId} className="field-error" role="alert">{error}</span>}
      {!error && helperText && <span id={helperId} className="field-helper">{helperText}</span>}
    </div>
  )
}
