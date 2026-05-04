import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

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
      const items = prev.items.filter(i => i.productId !== productId)
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

  if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading cart…</div>

  return (
    <div style={{ padding: '2rem', maxWidth: 480, margin: '0 auto', color: '#fff' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Your Cart</h1>

      {cart.items.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>Your cart is empty.</p>
      ) : (
        <>
          {cart.items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #374151' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>₹{item.price} × {item.quantity}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span>₹{item.price * item.quantity}</span>
                <button onClick={() => remove(item.productId)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontWeight: 700, fontSize: 18 }}>
            <span>Total</span>
            <span>₹{cart.totalAmount}</span>
          </div>

          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Delivery address (optional)"
            style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
          />

          <button onClick={placeOrder} style={{ marginTop: '1rem', width: '100%', padding: '0.875rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
            Place Order
          </button>
        </>
      )}
    </div>
  )
}
