import React from 'react'
import Button from './Button'

export default function EmptyState({ icon = '🍽️', title, subtitle, actionLabel, onAction, round = false }) {
  return (
    <div className="state-block">
      <div className={['state-icon', round ? 'round' : ''].filter(Boolean).join(' ')} aria-hidden="true">{icon}</div>
      <div className="state-title">{title}</div>
      {subtitle && <div className="state-sub">{subtitle}</div>}
      {actionLabel && (
        <Button variant="primary" size="sm" onClick={onAction} style={{ marginTop: 6 }}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
