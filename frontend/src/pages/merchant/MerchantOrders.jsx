import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const STATUS_OPTIONS = ['PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

export default function MerchantOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  if (loading) return <div className="page-loading">Loading orders...</div>

  return (
    <div className="page-shell">
      <div className="page-header">
        <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <div>
          <h1 className="page-title">Orders</h1>
          {orders.length > 0 && (
            <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} received</p>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h2 className="empty-state-title">No orders yet</h2>
          <p className="empty-state-sub">New orders from customers will appear here.</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <div className="customer-name">{order.customerId?.name || 'Customer'}</div>
                <div className="customer-email">{order.customerId?.email}</div>
                <div className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <span className={`status-badge ${order.status}`}>{order.status.replace('_', ' ')}</span>
            </div>

            <div className="order-items">
              {order.items.map(item => (
                <div key={item.productId} className="order-item-row">
                  <span className="order-item-name">{item.name}</span>
                  <span className="order-item-qty">×{item.quantity}</span>
                  <span className="order-item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="order-total-row">
              <span className="order-total-label">Total</span>
              <span className="order-total-amount">₹{order.totalAmount}</span>
            </div>

            {order.deliveryAddress && (
              <div className="delivery-address-display">📍 {order.deliveryAddress}</div>
            )}

            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <div className="status-buttons">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    className="status-btn"
                    onClick={() => updateStatus(order._id, s)}
                    disabled={order.status === s}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
