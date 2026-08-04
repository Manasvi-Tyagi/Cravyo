import React from 'react'

export default function QuantityControl({ quantity, onIncrease, onDecrease, onRemove, disabled = false }) {
  const atMinimum = quantity <= 1

  return (
    <div className="qty-control">
      <button
        type="button"
        className={['qty-btn', atMinimum ? 'qty-btn-remove' : ''].filter(Boolean).join(' ')}
        aria-label={atMinimum ? 'Remove item' : 'Decrease quantity'}
        onClick={atMinimum ? onRemove : onDecrease}
        disabled={disabled}
      >
        {atMinimum ? '🗑' : '−'}
      </button>
      <span className="qty-value" aria-live="polite">{quantity}</span>
      <button
        type="button"
        className="qty-btn"
        aria-label="Increase quantity"
        onClick={onIncrease}
        disabled={disabled}
      >
        +
      </button>
    </div>
  )
}
