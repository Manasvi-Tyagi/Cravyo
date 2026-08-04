import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import BottomNav from '../../components/BottomNav'
import OrderCard from '../../components/OrderCard'
import { PageHeader, EmptyState, PageLevelError, LoadingSkeleton, ConfirmDialog, useToast } from '../../components/ui'

const STATUS = { LOADING: 'loading', READY: 'ready', UNAUTHENTICATED: 'unauthenticated', ERROR: 'error' }

export default function Orders() {
  const [status, setStatus] = React.useState(STATUS.LOADING)
  const [orders, setOrders] = React.useState([])
  const [pendingCancelId, setPendingCancelId] = React.useState(null)
  const [cancelling, setCancelling] = React.useState(false)
  const [orderErrors, setOrderErrors] = React.useState({})
  const navigate = useNavigate()
  const { showToast } = useToast()

  const load = React.useCallback(() => {
    setStatus(STATUS.LOADING)
    api.get('/api/orders/my')
      .then((res) => {
        setOrders(res.data.data?.orders || [])
        setStatus(STATUS.READY)
      })
      .catch((error) => setStatus(error.response?.status === 401 ? STATUS.UNAUTHENTICATED : STATUS.ERROR))
  }, [])

  React.useEffect(() => { load() }, [load])

  const confirmCancel = async () => {
    const orderId = pendingCancelId
    setCancelling(true)
    setOrderErrors((prev) => ({ ...prev, [orderId]: '' }))
    try {
      const res = await api.patch(`/api/orders/${orderId}/cancel`)
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.data.order : o)))
      showToast('Your order was cancelled')
      setPendingCancelId(null)
    } catch (err) {
      setOrderErrors((prev) => ({ ...prev, [orderId]: err.response?.data?.message || 'The order could not be updated. Try again.' }))
      setPendingCancelId(null)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="page-shell">
      <PageHeader title="My Orders" subtitle={status === STATUS.READY && orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''}` : undefined} />

      {status === STATUS.LOADING && <LoadingSkeleton variant="list" count={3} />}

      {status === STATUS.UNAUTHENTICATED && (
        <EmptyState round icon="👤" title="Sign in to see your orders" actionLabel="Sign in" onAction={() => navigate('/user/login')} />
      )}

      {status === STATUS.ERROR && <PageLevelError message="Couldn't load your orders." onRetry={load} />}

      {status === STATUS.READY && (
        orders.length === 0 ? (
          <EmptyState icon="📦" title="No orders yet" subtitle="Your order history will appear here once you place an order." actionLabel="Browse Home" onAction={() => navigate('/')} />
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                role="customer"
                actionError={orderErrors[order._id]}
                onRequestCancel={() => setPendingCancelId(order._id)}
                cancelling={cancelling && pendingCancelId === order._id}
              />
            ))}
          </div>
        )
      )}

      <BottomNav />

      <ConfirmDialog
        open={Boolean(pendingCancelId)}
        title="Cancel this order?"
        description="This can't be undone once confirmed."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setPendingCancelId(null)}
      />
    </div>
  )
}
