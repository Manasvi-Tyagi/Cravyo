import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import FoodPartnerBottomNav, { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'
import FoodPartnerTopBar from '../../components/FoodPartnerTopBar'
import MerchantIdentityBlock from '../../components/MerchantIdentityBlock'
import ProductGridTile from '../../components/ProductGridTile'
import { IconButton, EmptyState, PageLevelError, LoadingSkeleton } from '../../components/ui'

const STATUS = { LOADING: 'loading', READY: 'ready', NOT_FOUND: 'not-found', ERROR: 'error' }

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = React.useState(STATUS.LOADING)
  const [partnerOwnProfile, setPartnerOwnProfile] = React.useState(false)
  const [merchant, setMerchant] = React.useState(null)
  const [products, setProducts] = React.useState([])

  const load = React.useCallback(() => {
    setStatus(STATUS.LOADING)
    api.get(`/api/merchant/${id}`)
      .then((response) => {
        const data = response.data.data
        setMerchant(data.merchant)
        setProducts(data.products || [])
        setStatus(STATUS.READY)
      })
      .catch((error) => {
        setStatus(error.response?.status === 404 ? STATUS.NOT_FOUND : STATUS.ERROR)
      })
  }, [id])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    const storedMerchantId = localStorage.getItem(FOOD_PARTNER_ID_KEY)
    if (!storedMerchantId || String(storedMerchantId) !== String(id)) { setPartnerOwnProfile(false); return }
    api.get('/api/auth/merchant/me')
      .then((res) => setPartnerOwnProfile(String(res.data.data?.id) === String(id)))
      .catch(() => setPartnerOwnProfile(false))
  }, [id])

  const openReel = (productId) => navigate('/', { state: { reelId: productId } })

  return (
    <div className="profile-page" style={partnerOwnProfile ? { paddingBottom: 'var(--bottom-nav-height)' } : undefined}>
      {partnerOwnProfile ? (
        <FoodPartnerTopBar />
      ) : (
        <div className="profile-topbar">
          <IconButton label="Back" onClick={() => navigate(-1)}>←</IconButton>
        </div>
      )}

      {status === STATUS.LOADING && (
        <div className="profile-loading-block">
          <div className="profile-identity-card">
            <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 16 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skeleton" style={{ height: 16, width: '60%' }} />
              <div className="skeleton" style={{ height: 12, width: '40%' }} />
            </div>
          </div>
          <div style={{ padding: '0 12px' }}>
            <LoadingSkeleton variant="grid" count={4} />
          </div>
        </div>
      )}

      {status === STATUS.NOT_FOUND && (
        <EmptyState
          round
          icon="?"
          title="Store not found"
          subtitle="This Food Partner isn't available anymore."
          actionLabel="Back to Home"
          onAction={() => navigate('/')}
        />
      )}

      {status === STATUS.ERROR && (
        <PageLevelError message="Couldn't load this store." onRetry={load} />
      )}

      {status === STATUS.READY && (
        <>
          <MerchantIdentityBlock merchant={merchant} />
          {products.length === 0 ? (
            <EmptyState icon="🍽️" title="No products uploaded yet" />
          ) : (
            <div className="profile-videos">
              {products.map((product) => (
                <ProductGridTile key={product._id} product={product} showPrice onClick={() => openReel(product._id)} />
              ))}
            </div>
          )}
        </>
      )}

      {partnerOwnProfile && <FoodPartnerBottomNav />}
    </div>
  )
}
