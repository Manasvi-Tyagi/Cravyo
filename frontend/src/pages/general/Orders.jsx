import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import BottomNav from '../../components/BottomNav'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  if (loading) return <div className="page-loading">Loading orders...</div>

  return (
    <div className="page-shell">
      <div className="page-header">
        <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <div>
          <h1 className="page-title">My Orders</h1>
          {orders.length > 0 && (
            <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h2 className="empty-state-title">No orders yet</h2>
          <p className="empty-state-sub">Your order history will appear here once you place an order.</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <div className="order-merchant-name">
                  {order.merchantId?.restaurantName || order.merchantId?.name || 'Restaurant'}
                </div>
                <div className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
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

            {order.status === 'PLACED' && (
              <button className="cancel-order-btn" onClick={() => cancel(order._id)}>
                Cancel Order
              </button>
            )}
          </div>
        ))
      )}
      <BottomNav />
    </div>
  )
}
