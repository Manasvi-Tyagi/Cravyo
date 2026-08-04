import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import FoodPartnerBottomNav from '../../components/FoodPartnerBottomNav'
import FoodPartnerTopBar from '../../components/FoodPartnerTopBar'
import OrderCard from '../../components/OrderCard'
import { PageHeader, StatusBadge, Button, EmptyState, PageLevelError, LoadingSkeleton, ConfirmDialog } from '../../components/ui'
import { nextStatusFor, NEXT_STATUS_LABEL } from '../../utils/orderStatus'

const STATUS = { LOADING: 'loading', READY: 'ready', UNAUTHENTICATED: 'unauthenticated', ERROR: 'error' }

export default function MerchantOrders() {
  const navigate = useNavigate()
  const [status, setStatus] = React.useState(STATUS.LOADING)
  const [orders, setOrders] = React.useState([])
  const [pendingChange, setPendingChange] = React.useState(null) // { orderId, nextStatus }
  const [updating, setUpdating] = React.useState(false)
  const [orderErrors, setOrderErrors] = React.useState({})

  const load = React.useCallback(() => {
    setStatus(STATUS.LOADING)
    api.get('/api/merchant/orders/all')
      .then((res) => {
        setOrders(res.data.data?.orders || [])
        setStatus(STATUS.READY)
      })
      .catch((error) => setStatus(error.response?.status === 401 ? STATUS.UNAUTHENTICATED : STATUS.ERROR))
  }, [])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    if (status === STATUS.UNAUTHENTICATED) navigate('/food-partner/login', { replace: true })
  }, [status, navigate])

  const confirmStatusChange = async () => {
    const { orderId, nextStatus } = pendingChange
    setUpdating(true)
    setOrderErrors((prev) => ({ ...prev, [orderId]: '' }))
    try {
      const res = await api.patch(`/api/merchant/orders/${orderId}/status`, { status: nextStatus })
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.data.order : o)))
      setPendingChange(null)
    } catch (err) {
      setOrderErrors((prev) => ({ ...prev, [orderId]: err.response?.data?.message || 'The order could not be updated. Try again.' }))
      setPendingChange(null)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <FoodPartnerTopBar />
      <div className="page-shell">
      <PageHeader title="Incoming orders" showBack={false} subtitle={status === STATUS.READY && orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''} received` : undefined} />

      {status === STATUS.LOADING && <LoadingSkeleton variant="list" count={3} />}
      {status === STATUS.ERROR && <PageLevelError message="Couldn't load your orders." onRetry={load} />}

      {status === STATUS.READY && (
        orders.length === 0 ? (
          <EmptyState icon="🍽️" title="No orders yet" subtitle="Orders for your products will show up here." />
        ) : (
          <>
            <div className="order-list merchant-orders-cards">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  role="merchant"
                  actionError={orderErrors[order._id]}
                  updating={updating && pendingChange?.orderId === order._id}
                  onRequestStatusChange={(nextStatus) => setPendingChange({ orderId: order._id, nextStatus })}
                />
              ))}
            </div>

            <div className="merchant-orders-table-wrap">
              <table className="merchant-orders-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Address</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const nextStatus = nextStatusFor(order.status)
                    return (
                      <tr key={order._id}>
                        <td>
                          {order.customerId?.name || 'Customer'}<br />
                          <span className="muted">{order.customerId?.email}</span>
                        </td>
                        <td>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}</td>
                        <td className="muted">{order.deliveryAddress}</td>
                        <td style={{ fontWeight: 700 }}>₹{order.totalAmount}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td>
                          {nextStatus ? (
                            <Button
                              size="sm"
                              loading={updating && pendingChange?.orderId === order._id}
                              onClick={() => setPendingChange({ orderId: order._id, nextStatus })}
                            >
                              {NEXT_STATUS_LABEL[nextStatus]}
                            </Button>
                          ) : (
                            <span className="muted">No further action</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
      </div>
      <FoodPartnerBottomNav />

      <ConfirmDialog
        open={Boolean(pendingChange)}
        title={pendingChange ? `Mark as ${NEXT_STATUS_LABEL[pendingChange.nextStatus]?.replace('Start ', '').replace('Mark ', '')}?` : ''}
        description="The customer will see this update."
        confirmLabel="Confirm"
        loading={updating}
        onConfirm={confirmStatusChange}
        onCancel={() => setPendingChange(null)}
      />
    </>
  )
}
