import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

const STATUS_OPTIONS = ['PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
const STATUS_COLOR = {
  PLACED: '#60a5fa',
  PREPARING: '#fbbf24',
  OUT_FOR_DELIVERY: '#a78bfa',
  DELIVERED: '#34d399',
  CANCELLED: '#f87171',
}

export default function MerchantOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/merchant/orders/all')
      .then(res => setOrders(res.data.data?.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (orderId, status) => {
    try {
      const res = await api.patch(`/api/merchant/orders/${orderId}/status`, { status })
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.data.order : o))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading orders…</div>

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto', color: '#fff' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Orders Dashboard</h1>

      {orders.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>No orders received yet.</p>
      ) : orders.map(order => (
        <div key={order._id} style={{ background: '#1f2937', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{order.customerId?.name || 'Customer'}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{order.customerId?.email}</div>
            </div>
            <span style={{ fontWeight: 700, color: STATUS_COLOR[order.status] || '#fff' }}>{order.status}</span>
          </div>

          {order.items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 4 }}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontWeight: 700, marginBottom: 12 }}>
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>

          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(order._id, s)}
                  disabled={order.status === s}
                  style={{ padding: '0.4rem 0.75rem', background: order.status === s ? '#374151' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: order.status === s ? 'default' : 'pointer', fontSize: 12 }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
