import React from 'react'
import api from '../../api/axios'
import { useLocation, useNavigate } from 'react-router-dom'
import CommentsModal from '../../components/CommentsModal'
import BottomNav from '../../components/BottomNav'
import ProductReel from '../../components/ProductReel'
import { EmptyState, PageLevelError, useToast } from '../../components/ui'

const AUTH_REQUIRED_MESSAGE = {
  like: 'Sign in to like dishes',
  save: 'Sign in to save dishes',
  cart: 'Sign in to add to cart',
}

export default function Home() {
  const [videos, setVideos] = React.useState([])
  const [savedIds, setSavedIds] = React.useState(new Set())
  const [likedIds, setLikedIds] = React.useState(new Set())
  const [cartAddedIds, setCartAddedIds] = React.useState(new Set())
  const [heartBeatId, setHeartBeatId] = React.useState(null)
  const videoRefs = React.useRef(new Map())
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)
  const [selectedReelId, setSelectedReelId] = React.useState(null)
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(true)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [initialLoading, setInitialLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState(false)
  const loadMoreRef = React.useRef(null)
  const requestInFlightRef = React.useRef(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const notifyAuthRequired = (action) => {
    showToast(AUTH_REQUIRED_MESSAGE[action] || 'Sign in to continue', {
      tone: 'error',
      linkLabel: 'Sign in',
      onLinkClick: () => navigate('/user/login'),
      duration: 4000,
    })
  }

  const fetchFeedPage = React.useCallback(async (requestedPage, replace = false) => {
    if (requestInFlightRef.current) return
    requestInFlightRef.current = true
    setIsLoadingMore(true)
    if (replace) setLoadError(false)
    try {
      const response = await api.get('/api/product/feed', { params: { page: requestedPage, limit: 10 } })
      const products = response.data.data?.products || []
      const pagination = response.data.data?.pagination
      setVideos((current) => {
        const combined = replace ? products : [...current, ...products]
        return Array.from(new Map(combined.map((product) => [product._id, product])).values())
      })
      setPage(requestedPage)
      setHasMore(pagination ? pagination.hasMore : products.length === 10)
    } catch (error) {
      console.error('Failed to load reels', error)
      if (replace) setLoadError(true)
    } finally {
      requestInFlightRef.current = false
      setIsLoadingMore(false)
      setInitialLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (entry.isIntersecting) video.play?.().catch(() => {})
          else video.pause()
        })
      },
      { threshold: 0.5 }
    )
    const observedVideos = Array.from(videoRefs.current.values())
    observedVideos.forEach((video) => observer.observe(video))
    return () => { observedVideos.forEach((video) => observer.unobserve(video)) }
  }, [videos])

  React.useEffect(() => {
    const reelId = location.state?.reelId
    if (!reelId || videos.length === 0) return
    document.querySelector(`[data-reel-id="${CSS.escape(reelId)}"]`)?.scrollIntoView({ behavior: 'smooth' })
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate, videos])

  const setVideoRef = (id) => (el) => {
    if (el) videoRefs.current.set(id, el)
    else videoRefs.current.delete(id)
  }

  React.useEffect(() => {
    const fetchData = async () => {
      await fetchFeedPage(1, true)
      try {
        const [likedRes, savedRes] = await Promise.all([
          api.get('/api/product/liked'),
          api.get('/api/product/saved'),
        ])
        setLikedIds(new Set((likedRes.data.data?.products || []).map((f) => f._id)))
        setSavedIds(new Set((savedRes.data.data?.products || []).map((f) => f._id)))
      } catch {
        setLikedIds(new Set())
        setSavedIds(new Set())
      }
    }
    fetchData()
  }, [fetchFeedPage])

  React.useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel || !hasMore) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !requestInFlightRef.current) fetchFeedPage(page + 1)
      },
      { rootMargin: '500px 0px', threshold: 0.01 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchFeedPage, hasMore, page])

  const handleCommentAdded = (foodId, increment = 1) => {
    setVideos((prev) => prev.map((v) => (v._id === foodId ? { ...v, commentCount: Math.max(0, (v.commentCount ?? 0) + increment) } : v)))
  }

  const toggleLike = async (foodId) => {
    const prevLiked = new Set(likedIds)
    const alreadyLiked = prevLiked.has(foodId)
    const nextLiked = new Set(prevLiked)
    if (alreadyLiked) nextLiked.delete(foodId)
    else nextLiked.add(foodId)

    const prevLikeCount = videos.find((v) => v._id === foodId)?.likeCount ?? 0

    setLikedIds(nextLiked)
    setVideos((prev) => prev.map((v) => (v._id === foodId ? { ...v, likeCount: Math.max(0, (v.likeCount ?? 0) + (alreadyLiked ? -1 : 1)) } : v)))

    if (!alreadyLiked) {
      setHeartBeatId(foodId)
      setTimeout(() => setHeartBeatId(null), 500)
    }

    try {
      await api.post('/api/product/like', { productId: foodId })
    } catch (e) {
      setLikedIds(prevLiked)
      setVideos((prev) => prev.map((v) => (v._id === foodId ? { ...v, likeCount: prevLikeCount } : v)))
      if (e.response?.status === 401) notifyAuthRequired('like')
    }
  }

  const toggleSave = async (foodId) => {
    const prevSaved = new Set(savedIds)
    const alreadySaved = prevSaved.has(foodId)
    const nextSaved = new Set(prevSaved)
    if (alreadySaved) nextSaved.delete(foodId)
    else nextSaved.add(foodId)

    const prevSaveCount = videos.find((v) => v._id === foodId)?.saveCount ?? 0

    setSavedIds(nextSaved)
    setVideos((prev) => prev.map((v) => (v._id === foodId ? { ...v, saveCount: Math.max(0, (v.saveCount ?? 0) + (alreadySaved ? -1 : 1)) } : v)))

    try {
      await api.post('/api/product/save', { productId: foodId })
      if (!alreadySaved) showToast('Saved')
    } catch (e) {
      setSavedIds(prevSaved)
      setVideos((prev) => prev.map((v) => (v._id === foodId ? { ...v, saveCount: prevSaveCount } : v)))
      if (e.response?.status === 401) notifyAuthRequired('save')
    }
  }

  const addToCart = async (productId) => {
    try {
      await api.post('/api/cart/add', { productId, quantity: 1 })
      showToast('Added to cart')
      setCartAddedIds((prev) => new Set([...prev, productId]))
      setTimeout(() => {
        setCartAddedIds((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
      }, 2500)
    } catch (e) {
      if (e.response?.status === 401) notifyAuthRequired('cart')
    }
  }

  return (
    <div className="reels-shell">
      {initialLoading ? (
        <div className="reel-item">
          <div className="skeleton reel-skeleton-fill" />
        </div>
      ) : loadError ? (
        <div className="reels-shell-state">
          <PageLevelError message="Couldn't load the feed." onRetry={() => fetchFeedPage(1, true)} />
        </div>
      ) : videos.length === 0 ? (
        <div className="reels-shell-state">
          <EmptyState
            icon="🍽️"
            title="Discover something worth craving"
            subtitle="No dishes are available right now. Check back soon."
          />
        </div>
      ) : (
        <div className="reels-list">
          {videos.map((reel) => (
            <ProductReel
              key={reel._id}
              product={reel}
              videoRef={setVideoRef(reel._id)}
              liked={likedIds.has(reel._id)}
              saved={savedIds.has(reel._id)}
              cartAdded={cartAddedIds.has(reel._id)}
              heartBeat={heartBeatId === reel._id}
              onToggleLike={() => toggleLike(reel._id)}
              onToggleSave={() => toggleSave(reel._id)}
              onAddToCart={() => addToCart(reel._id)}
              onOpenComments={() => { setSelectedReelId(reel._id); setIsCommentsOpen(true) }}
            />
          ))}
          <div ref={loadMoreRef} className="feed-load-sentinel" aria-live="polite">
            {isLoadingMore ? 'Loading more reels…' : !hasMore && videos.length > 0 ? 'You’re all caught up' : ''}
          </div>
        </div>
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
