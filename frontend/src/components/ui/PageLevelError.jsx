import React from 'react'
import Button from './Button'

export default function PageLevelError({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="state-block" role="alert">
      <div className="state-icon round" aria-hidden="true">!</div>
      <div className="state-title">{message}</div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} style={{ marginTop: 6 }}>
          Retry
        </Button>
      )}
    </div>
  )
}
