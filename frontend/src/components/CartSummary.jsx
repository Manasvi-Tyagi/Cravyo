import React from 'react'
import { Button, InlineError } from './ui'

export default function CartSummary({ total, address, onAddressChange, onPlaceOrder, placing, error }) {
  const hasAddress = address.trim().length > 0

  return (
    <div className="cart-layout-summary">
      <InlineError>{error}</InlineError>
      <div className="cart-total-row">
        <span className="cart-total-label">Total</span>
        <span className="cart-total-amount">₹{total}</span>
      </div>

      <div className="delivery-address-label">Delivery address</div>
      <input
        className="delivery-address-input"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder="Enter your delivery address"
        aria-label="Delivery address"
      />

      <Button
        fullWidth
        onClick={onPlaceOrder}
        disabled={!hasAddress}
        loading={placing}
        loadingLabel="Placing order…"
      >
        Place order
      </Button>
      {!hasAddress && (
        <p className="delivery-address-hint">Enter a delivery address to place your order</p>
      )}
    </div>
  )
}
