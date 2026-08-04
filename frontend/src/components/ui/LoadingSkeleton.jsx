import React from 'react'

function GridSkeleton({ count }) {
  return (
    <div className="explore-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius)' }} />
      ))}
    </div>
  )
}

function ListSkeleton({ count }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          <div className="skeleton" style={{ width: 76, height: 76, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
            <div className="skeleton" style={{ height: 12, width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function TextSkeleton({ count }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 14, width: i % 2 ? '70%' : '90%' }} />
      ))}
    </div>
  )
}

export default function LoadingSkeleton({ variant = 'text', count = 4 }) {
  return (
    <div aria-busy="true">
      {variant === 'grid' && <GridSkeleton count={count} />}
      {variant === 'list' && <ListSkeleton count={count} />}
      {variant === 'text' && <TextSkeleton count={count} />}
    </div>
  )
}
