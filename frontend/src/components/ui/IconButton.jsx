import React from 'react'

export default function IconButton({
  label,
  active = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type="button"
      className={['icon-btn', className].filter(Boolean).join(' ')}
      aria-label={label}
      aria-pressed={active}
      {...rest}
    >
      {children}
    </button>
  )
}
