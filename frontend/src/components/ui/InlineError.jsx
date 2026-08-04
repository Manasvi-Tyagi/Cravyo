import React from 'react'

export default function InlineError({ children }) {
  if (!children) return null
  return (
    <div className="inline-error-banner" role="alert">
      {children}
    </div>
  )
}
