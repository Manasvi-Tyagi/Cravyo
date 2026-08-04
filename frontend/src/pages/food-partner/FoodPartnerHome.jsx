import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import FoodPartnerBottomNav from '../../components/FoodPartnerBottomNav'
import FoodPartnerTopBar from '../../components/FoodPartnerTopBar'
import ProductGridTile from '../../components/ProductGridTile'
import { PageHeader, Button, EmptyState, PageLevelError, LoadingSkeleton } from '../../components/ui'

const STATUS = { LOADING: 'loading', READY: 'ready', UNAUTHENTICATED: 'unauthenticated', ERROR: 'error' }

export default function FoodPartnerHome() {
  const navigate = useNavigate()
  const [status, setStatus] = React.useState(STATUS.LOADING)
  const [products, setProducts] = React.useState([])

  const load = React.useCallback(() => {
    setStatus(STATUS.LOADING)
    api.get('/api/auth/merchant/me')
      .then((meRes) => api.get(`/api/merchant/${meRes.data.data.id}`))
      .then((res) => {
        setProducts(res.data.data?.products || [])
        setStatus(STATUS.READY)
      })
      .catch((error) => setStatus(error.response?.status === 401 ? STATUS.UNAUTHENTICATED : STATUS.ERROR))
  }, [])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    if (status === STATUS.UNAUTHENTICATED) navigate('/food-partner/login', { replace: true })
  }, [status, navigate])

  const openReel = (productId) => navigate('/', { state: { reelId: productId } })

  return (
    <>
      <FoodPartnerTopBar />
      <div className="page-shell">
        <PageHeader
          title="Your products"
          showBack={false}
          rightAction={<Button size="sm" onClick={() => navigate('/create-food')}>＋ Add</Button>}
        />

        {status === STATUS.LOADING && <LoadingSkeleton variant="grid" count={4} />}

        {status === STATUS.ERROR && <PageLevelError message="Couldn't load your products." onRetry={load} />}

        {status === STATUS.READY && (
          products.length === 0 ? (
            <EmptyState
              icon="🍽️"
              title="No products uploaded yet"
              actionLabel="Upload your first product"
              onAction={() => navigate('/create-food')}
            />
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductGridTile key={product._id} product={product} onClick={() => openReel(product._id)} />
              ))}
            </div>
          )
        )}
      </div>
      <FoodPartnerBottomNav />
    </>
  )
}
