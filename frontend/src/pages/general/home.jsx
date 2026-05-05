import React from 'react'
import api from '../../api/axios'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import CommentsModal from '../../components/CommentsModal'

const LS_KEYS = {
  saved: 'savedFoodIds',
  liked: 'likedFoodIds',
}

function safeLoadIdSet(key) {
  try {
    const raw = localStorage.getItem(key)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function persistSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]))
  } catch {
    /* ignore quota / privacy mode */
  }
}

function HomeGlyph({ active }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
        stroke={active ? '#FF6B35' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? 'rgba(255,107,53,0.15)' : 'none'}
      />
    </svg>
  )
}

function SavedGlyph({ active }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1Z"
        stroke={active ? '#FF6B35' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? 'rgba(255,107,53,0.15)' : 'none'}
      />
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg className="action-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-7-4.6-9.3-8.5C.6 9.1 2.3 5.9 5.6 5.2c1.7-.4 3.4.2 4.4 1.5 1-1.3 2.7-1.9 4.4-1.5 3.3.7 5 3.9 2.9 7.3C19 16.4 12 21 12 21Z"
        fill={filled ? '#ef4444' : 'transparent'}
        stroke={filled ? '#ef4444' : 'currentColor'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg className="action-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 18l-3 3V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7Z"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 10h8M8 14h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BookmarkIcon({ filled }) {
  return (
    <svg className="action-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1Z"
        fill={filled ? '#60a5fa' : 'transparent'}
        stroke={filled ? '#60a5fa' : 'currentColor'}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProfileGlyph({ active }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke={active ? '#FF6B35' : 'currentColor'} strokeWidth="1.8" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? '#FF6B35' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CartGlyph({ active }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={active ? '#FF6B35' : 'currentColor'} strokeWidth="1.8" strokeLinejoin="round"/>
      <line x1="3" y1="6" x2="21" y2="6" stroke={active ? '#FF6B35' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 10a4 4 0 01-8 0" stroke={active ? '#FF6B35' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function BottomNav() {
  const location = useLocation()
  const homeActive = location.pathname === '/'
  const savedActive = location.pathname.startsWith('/saved')
  const cartActive = location.pathname.startsWith('/cart')
  const profileActive = location.pathname.startsWith('/user')

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <NavLink to="/" end className={homeActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
        <HomeGlyph active={homeActive} />
        <span className="bottom-nav-label">home</span>
      </NavLink>

      <NavLink to="/saved" className={savedActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
        <SavedGlyph active={savedActive} />
        <span className="bottom-nav-label">saved</span>
      </NavLink>

      <NavLink to="/cart" className={cartActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
        <CartGlyph active={cartActive} />
        <span className="bottom-nav-label">cart</span>
      </NavLink>

      <NavLink to="/user/login" className={profileActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
        <ProfileGlyph active={profileActive} />
        <span className="bottom-nav-label">login</span>
      </NavLink>
    </nav>
  )
}

const Home = () => {
  const [videos, setVideos] = React.useState([])
  const [savedIds, setSavedIds] = React.useState(() => safeLoadIdSet(LS_KEYS.saved))
  const [likedIds, setLikedIds] = React.useState(() => safeLoadIdSet(LS_KEYS.liked))
  const [cartAddedIds, setCartAddedIds] = React.useState(new Set())
  const [heartBeatId, setHeartBeatId] = React.useState(null)
  const videoRefs = React.useRef(new Map())
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)
  const [selectedReelId, setSelectedReelId] = React.useState(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (video) {
            if (entry.isIntersecting) video.play()
            else video.pause()
          }
        })
      },
      { threshold: 0.5 }
    )
    const observedVideos = Array.from(videoRefs.current.values())
    observedVideos.forEach((video) => observer.observe(video))
    return () => { observedVideos.forEach((video) => observer.unobserve(video)) }
  }, [videos])


  const setVideoRef = (id) => (el) => {
    if (el) videoRefs.current.set(id, el)
    else videoRefs.current.delete(id)
  }

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const foodsRes = await api.get('/api/product/feed')
        setVideos(foodsRes.data.data?.products || foodsRes.data.food || [])
      } catch (err) {
        console.error('Failed to load reels', err)
        return
      }
      try {
        const [likedRes, savedRes] = await Promise.all([
          api.get('/api/product/liked'),
          api.get('/api/product/saved'),
        ])
        setLikedIds(new Set((likedRes.data.data?.products || likedRes.data.foods || []).map((f) => f._id)))
        setSavedIds(new Set((savedRes.data.data?.products || savedRes.data.foods || []).map((f) => f._id)))
      } catch {
        setLikedIds(new Set())
        setSavedIds(new Set())
      }
    }
    fetchData()
  }, [])

  const handleCommentAdded = (foodId, increment = 1) => {
    setVideos((prev) =>
      prev.map((v) =>
        v._id === foodId
          ? { ...v, commentCount: Math.max(0, (v.commentCount ?? 0) + increment) }
          : v
      )
    )
  }

  const toggleLike = async (foodId) => {
    const prevLiked = new Set(likedIds)
    const alreadyLiked = prevLiked.has(foodId)
    const nextLiked = new Set(prevLiked)
    if (alreadyLiked) nextLiked.delete(foodId)
    else nextLiked.add(foodId)

    const prevLikeCount = videos.find((v) => v._id === foodId)?.likeCount ?? 0

    setLikedIds(nextLiked)
    persistSet(LS_KEYS.liked, nextLiked)
    setVideos((prev) =>
      prev.map((v) =>
        v._id === foodId
          ? { ...v, likeCount: Math.max(0, (v.likeCount ?? 0) + (alreadyLiked ? -1 : 1)) }
          : v
      )
    )

    if (!alreadyLiked) {
      setHeartBeatId(foodId)
      setTimeout(() => setHeartBeatId(null), 500)
    }

    try {
      await api.post('/api/product/like', { productId: foodId })
    } catch (e) {
      console.error('Toggle like failed', e)
      setLikedIds(prevLiked)
      persistSet(LS_KEYS.liked, prevLiked)
      setVideos((prev) => prev.map((v) => (v._id === foodId ? { ...v, likeCount: prevLikeCount } : v)))
    }
  }

  const navigate = useNavigate()

  const toggleSave = async (foodId) => {
    const prevSaved = new Set(savedIds)
    const alreadySaved = prevSaved.has(foodId)
    const nextSaved = new Set(prevSaved)
    if (alreadySaved) nextSaved.delete(foodId)
    else nextSaved.add(foodId)

    const prevSaveCount = videos.find((v) => v._id === foodId)?.saveCount ?? 0

    setSavedIds(nextSaved)
    persistSet(LS_KEYS.saved, nextSaved)
    setVideos((prev) =>
      prev.map((v) =>
        v._id === foodId
          ? { ...v, saveCount: Math.max(0, (v.saveCount ?? 0) + (alreadySaved ? -1 : 1)) }
          : v
      )
    )

    try {
      await api.post('/api/product/save', { productId: foodId })
    } catch (e) {
      console.error('Toggle save failed', e)
      setSavedIds(prevSaved)
      persistSet(LS_KEYS.saved, prevSaved)
      setVideos((prev) => prev.map((v) => (v._id === foodId ? { ...v, saveCount: prevSaveCount } : v)))
    }
  }

  const addToCart = async (productId) => {
    try {
      await api.post('/api/cart/add', { productId, quantity: 1 })
      setCartAddedIds((prev) => new Set([...prev, productId]))
      setTimeout(() => {
        setCartAddedIds((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
      }, 2500)
    } catch (e) {
      console.error('Add to cart failed', e)
    }
  }

  return (
    <div className="reels-shell">
      <div className="reels-list">
        {videos.map((reel) => (
          <section className="reel-item" key={reel._id}>
            <video
              src={reel.videoUrl || reel.video}
              ref={setVideoRef(reel._id)}
              className="reel-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="reel-actions" aria-label="Reel actions">
              <div className="action-stack">
                <button
                  className={[
                    'action-btn',
                    likedIds.has(reel._id) ? 'active like-active' : '',
                    heartBeatId === reel._id ? 'heart-beat' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => toggleLike(reel._id)}
                  aria-label="Like"
                  type="button"
                >
                  <HeartIcon filled={likedIds.has(reel._id)} />
                </button>
                <div className="action-count">{reel.likeCount ?? 0}</div>
              </div>

              <div className="action-stack">
                <button
                  className="action-btn"
                  type="button"
                  aria-label="Comment"
                  onClick={() => {
                    setSelectedReelId(reel._id)
                    setIsCommentsOpen(true)
                  }}
                >
                  <CommentIcon />
                </button>
                <div className="action-count">{reel.commentCount ?? 0}</div>
              </div>

              <div className="action-stack">
                <button
                  className={savedIds.has(reel._id) ? 'action-btn active save-active' : 'action-btn'}
                  onClick={() => toggleSave(reel._id)}
                  aria-label="Bookmark"
                  type="button"
                >
                  <BookmarkIcon filled={savedIds.has(reel._id)} />
                </button>
                <div className="action-count">{reel.saveCount ?? 0}</div>
              </div>
            </div>
            <div className="reel-overlay">
              <div className="reel-overlay-inner">
                <div className="reel-info">
                  {(reel.merchant?.restaurantName || reel.merchant?.name) && (
                    <div className="reel-merchant-tag">🍴 {reel.merchant.restaurantName || reel.merchant.name}</div>
                  )}
                  <div className="reel-title">{reel.name}</div>
                  <div className="reel-description">{reel.description}</div>
                  {reel.price && <div className="reel-price">₹{reel.price}</div>}
                  <button
                    className={cartAddedIds.has(reel._id) ? 'reel-add-cart cart-added' : 'reel-add-cart'}
                    onClick={() => addToCart(reel._id)}
                    type="button"
                  >
                    {cartAddedIds.has(reel._id) ? '✓ Added to Cart' : '🛒 Add to Cart'}
                  </button>
                </div>
                <Link className="reel-visit" to={'/store/' + (reel.merchant?._id || reel.merchant)}>
                  Visit Store
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>
      <BottomNav />
      <CommentsModal
        isOpen={isCommentsOpen}
        productId={selectedReelId}
        foodId={selectedReelId}
        onClose={() => setIsCommentsOpen(false)}
        reelData={videos.find((v) => v._id === selectedReelId)}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  )
}

export default Home