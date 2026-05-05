import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import BottomNav from '../../components/BottomNav'

export default function Cart() {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 })
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/cart')
      .then(res => setCart(res.data.data?.cart || { items: [], totalAmount: 0 }))
      .catch(() => setCart({ items: [], totalAmount: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (productId) => {
    await api.delete(`/api/cart/item/${productId}`)
    setCart(prev => {
      const items = prev.items.filter(i => String(i.productId) !== productId)
      return { ...prev, items, totalAmount: items.reduce((s, i) => s + i.price * i.quantity, 0) }
    })
  }

  const placeOrder = async () => {
    try {
      await api.post('/api/orders/place', { deliveryAddress: address })
      navigate('/orders')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order')
    }
  }

  if (loading) return <div className="page-loading">Loading cart...</div>

  return (
    <div className="page-shell">
      <div className="page-header">
        <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <div>
          <h1 className="page-title">Your Cart</h1>
          {cart.items.length > 0 && (
            <p className="page-subtitle">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h2 className="empty-state-title">Your cart is empty</h2>
          <p className="empty-state-sub">Add some delicious items from the feed to get started.</p>
        </div>
      ) : (
        <>
          <div className="cart-summary-card">
            {cart.items.map(item => (
              <div key={item.productId} className="cart-item">
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-meta">₹{item.price} × {item.quantity}</div>
                </div>
                <div className="cart-item-right">
                  <span className="cart-item-total">₹{item.price * item.quantity}</span>
                  <button
                    className="cart-remove-btn"
                    onClick={() => remove(item.productId)}
                    aria-label="Remove item"
                  >✕</button>
                </div>
              </div>
            ))}

            <div className="order-total-row" style={{ marginTop: '0.75rem' }}>
              <span className="order-total-label">Total</span>
              <span className="order-total-amount">₹{cart.totalAmount}</span>
            </div>
          </div>

          <input
            className="delivery-address-input"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Delivery address (optional)"
          />

          <button className="place-order-btn" onClick={placeOrder}>
            Place Order →
          </button>
        </>
      )}
      <BottomNav />
    </div>
  )
}
