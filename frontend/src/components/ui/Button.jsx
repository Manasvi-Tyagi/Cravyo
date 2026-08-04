import React from 'react'

const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  destructive: 'btn-destructive',
  'destructive-filled': 'btn-destructive-filled',
  ghost: 'btn-ghost',
}

const Button = React.forwardRef(function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  children,
  loadingLabel,
  ...rest
}, ref) {
  const classes = [
    'btn',
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    size === 'sm' ? 'btn-sm' : '',
    fullWidth ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {loading ? (loadingLabel || children) : children}
    </button>
  )
})

export default Button
