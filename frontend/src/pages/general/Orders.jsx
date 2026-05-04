import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

const STATUS_COLOR = {
  PLACED: '#60a5fa',
  PREPARING: '#fbbf24',
  OUT_FOR_DELIVERY: '#a78bfa',
  DELIVERED: '#34d399',
  CANCELLED: '#f87171',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/orders/my')
      .then(res => setOrders(res.data.data?.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const cancel = async (orderId) => {
    try {
      const res = await api.patch(`/api/orders/${orderId}/cancel`)
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.data.order : o))
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel')
    }
  }

  if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading orders…</div>

  return (
    <div style={{ padding: '2rem', maxWidth: 560, margin: '0 auto', color: '#fff' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>My Orders</h1>

      {orders.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>No orders yet.</p>
      ) : orders.map(order => (
        <div key={order._id} style={{ background: '#1f2937', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span style={{ fontWeight: 700, color: STATUS_COLOR[order.status] || '#fff' }}>{order.status}</span>
          </div>

          <div style={{ fontSize: 13, color: '#d1d5db', marginBottom: 8 }}>
            {order.merchantId?.restaurantName || order.merchantId?.name || 'Restaurant'}
          </div>

          {order.items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 4 }}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontWeight: 700 }}>
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>

          {order.status === 'PLACED' && (
            <button onClick={() => cancel(order._id)} style={{ marginTop: 12, padding: '0.5rem 1rem', background: '#991b1b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Cancel Order
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
