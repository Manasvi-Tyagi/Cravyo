import React from 'react'
import api from '../../api/axios'
import { useNavigate } from 'react-router-dom'
import CommentsModal from '../../components/CommentsModal'
import BottomNav from '../../components/BottomNav'
import SavedProductCard from '../../components/SavedProductCard'
import { EmptyState, PageLevelError, LoadingSkeleton, useToast } from '../../components/ui'

const STATUS = { LOADING: 'loading', READY: 'ready', UNAUTHENTICATED: 'unauthenticated', ERROR: 'error' }

export default function Saved() {
  const [status, setStatus] = React.useState(STATUS.LOADING)
  const [products, setProducts] = React.useState([])
  const [removingIds, setRemovingIds] = React.useState(new Set())
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)
  const [selectedReelId, setSelectedReelId] = React.useState(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const load = React.useCallback(() => {
    setStatus(STATUS.LOADING)
    api.get('/api/product/saved')
      .then((res) => {
        setProducts(res.data.data?.products || [])
        setStatus(STATUS.READY)
      })
      .catch((error) => {
        setStatus(error.response?.status === 401 ? STATUS.UNAUTHENTICATED : STATUS.ERROR)
      })
  }, [])

  React.useEffect(() => { load() }, [load])

  const handleCommentAdded = (foodId, increment = 1) => {
    setProducts((prev) => prev.map((p) => (p._id === foodId ? { ...p, commentCount: Math.max(0, (p.commentCount ?? 0) + increment) } : p)))
  }

  const removeSaved = async (productId) => {
    setRemovingIds((prev) => new Set([...prev, productId]))
    try {
      await api.post('/api/product/save', { productId })
      setProducts((prev) => prev.filter((p) => p._id !== productId))
      showToast('Removed from Saved')
    } catch {
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  return (
    <div className="page-shell">
      <h1 className="page-title" style={{ marginBottom: 16 }}>Saved</h1>

      {status === STATUS.LOADING && <LoadingSkeleton variant="list" count={4} />}

      {status === STATUS.UNAUTHENTICATED && (
        <EmptyState
          round
          icon="👤"
          title="Sign in to see your saved dishes"
          actionLabel="Sign in"
          onAction={() => navigate('/user/login')}
        />
      )}

      {status === STATUS.ERROR && (
        <PageLevelError message="Couldn't load your saved dishes." onRetry={load} />
      )}

      {status === STATUS.READY && (
        products.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">🔖</div>
            <div className="saved-empty-title">No saved dishes yet</div>
            <div className="saved-empty-sub">Discover something worth craving</div>
          </div>
        ) : (
          <div className="saved-list">
            {products.map((product) => (
              <SavedProductCard
                key={product._id}
                product={product}
                removing={removingIds.has(product._id)}
                onOpenComments={() => { setSelectedReelId(product._id); setIsCommentsOpen(true) }}
                onRemove={() => removeSaved(product._id)}
              />
            ))}
          </div>
        )
      )}

      <BottomNav />
      <CommentsModal
        isOpen={isCommentsOpen}
        productId={selectedReelId}
        onClose={() => setIsCommentsOpen(false)}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  )
}
