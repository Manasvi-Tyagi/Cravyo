import React from 'react'
import { QuantityControl } from './ui'

export default function CartItem({ item, onIncrease, onDecrease, onRemove, disabled }) {
  return (
    <div className="cart-item">
      {item.image ? (
        <img className="cart-item-thumb" src={item.image} alt="" />
      ) : (
        <div className="cart-item-thumb" aria-hidden="true" />
      )}
      <div className="cart-item-body">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-unit">₹{item.price} each</div>
        <div className="cart-item-row">
          <QuantityControl
            quantity={item.quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onRemove={onRemove}
            disabled={disabled}
          />
          <span className="cart-item-total">₹{item.price * item.quantity}</span>
        </div>
      </div>
    </div>
  )
}
