import React from 'react'

const LABELS = {
  PLACED: 'Placed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export default function StatusBadge({ status }) {
  const label = LABELS[status] || status
  return (
    <span className={`status-pill ${status}`}>
      <span className="status-pill-dot" aria-hidden="true" />
      {label}
    </span>
  )
}
