import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import BottomNav from '../../components/BottomNav'
import CartItem from '../../components/CartItem'
import CartSummary from '../../components/CartSummary'
import { PageHeader, EmptyState, PageLevelError, LoadingSkeleton } from '../../components/ui'

export default function Cart() {
  const [cart, setCart] = React.useState({ items: [], totalAmount: 0 })
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState(false)
  const [address, setAddress] = React.useState('')
  const [placing, setPlacing] = React.useState(false)
  const [placeError, setPlaceError] = React.useState('')
  const [pendingProductId, setPendingProductId] = React.useState(null)
  const navigate = useNavigate()

  const load = React.useCallback(() => {
    setLoading(true)
    setLoadError(false)
    api.get('/api/cart')
      .then((res) => setCart(res.data.data?.cart || { items: [], totalAmount: 0 }))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const recalc = (items) => ({ items, totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0) })

  const updateQuantity = async (productId, quantity) => {
    setPendingProductId(productId)
    const prevCart = cart
    setCart((prev) => recalc(prev.items.map((i) => (i.productId === productId ? { ...i, quantity } : i))))
    try {
      await api.patch('/api/cart/update', { productId, quantity })
    } catch {
      setCart(prevCart)
    } finally {
      setPendingProductId(null)
    }
  }

  const removeItem = async (productId) => {
    const prevCart = cart
    setCart((prev) => recalc(prev.items.filter((i) => i.productId !== productId)))
    try {
      await api.delete(`/api/cart/item/${productId}`)
    } catch {
      setCart(prevCart)
    }
  }

  const placeOrder = async () => {
    setPlaceError('')
    setPlacing(true)
    try {
      await api.post('/api/orders/place', { deliveryAddress: address.trim() })
      navigate('/orders')
    } catch (err) {
      setPlaceError(err.response?.data?.message || "Order couldn't be placed. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader title="Cart" />
        <LoadingSkeleton variant="list" count={3} />
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Cart"
        subtitle={cart.items.length > 0 ? `${cart.items.length} item${cart.items.length !== 1 ? 's' : ''}` : undefined}
      />

      {loadError ? (
        <PageLevelError message="Couldn't load your cart." onRetry={load} />
      ) : cart.items.length === 0 ? (
        <EmptyState icon="🛒" title="Your cart is empty" actionLabel="Browse Home" onAction={() => navigate('/')} />
      ) : (
        <div className="cart-layout">
          <div className="cart-layout-items">
            {cart.items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                disabled={pendingProductId === item.productId}
                onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </div>
          <CartSummary
            total={cart.totalAmount}
            address={address}
            onAddressChange={setAddress}
            onPlaceOrder={placeOrder}
            placing={placing}
            error={placeError}
          />
        </div>
      )}
      <BottomNav />
    </div>
  )
}
