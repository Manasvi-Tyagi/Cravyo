import React from 'react'
import api from '../../api/axios'
import { Link } from 'react-router-dom'
import CommentsModal from '../../components/CommentsModal'
import BottomNav from '../../components/BottomNav'

const LS_KEYS = {
  saved: 'savedFoodIds',
  liked: 'likedFoodIds',
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

const Saved = () => {
  const [videos, setVideos] = React.useState([])
  const [savedIds, setSavedIds] = React.useState(new Set())
  const [likedIds, setLikedIds] = React.useState(new Set())
  const [heartBeatId, setHeartBeatId] = React.useState(null)
  const videoRefs = React.useRef(new Map())
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)
  const [selectedReelId, setSelectedReelId] = React.useState(null)

  const savedVideos = React.useMemo(
    () => videos.filter((v) => savedIds.has(v._id)),
    [videos, savedIds]
  )

  React.useEffect(() => {
    // Fetch all foods and user's liked/saved status in parallel
    Promise.all([
      api.get('/api/product/feed'),
      api.get('/api/product/liked'),
      api.get('/api/product/saved'),
    ])
      .then(([foodsRes, likedRes, savedRes]) => {
        setVideos(foodsRes.data.data?.products || foodsRes.data.food || [])
        setLikedIds(new Set((likedRes.data.data?.products || likedRes.data.foods || []).map(f => f._id)))
        setSavedIds(new Set((savedRes.data.data?.products || savedRes.data.foods || []).map(f => f._id)))
      })
      .catch((err) => console.error('Failed to load data', err))
  }, [])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!video) return
          if (entry.isIntersecting) video.play()
          else video.pause()
        })
      },
      { threshold: 0.5 }
    )
    const observedVideos = Array.from(videoRefs.current.values())
    observedVideos.forEach((video) => observer.observe(video))
    return () => {
      observedVideos.forEach((video) => observer.unobserve(video))
    }
  }, [savedVideos])

  const setVideoRef = (id) => (el) => {
    if (el) videoRefs.current.set(id, el)
    else videoRefs.current.delete(id)
  }

  const persistSet = (key, nextSet) => {
    localStorage.setItem(key, JSON.stringify(Array.from(nextSet)))
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
      setVideos((prev) =>
        prev.map((v) => (v._id === foodId ? { ...v, likeCount: prevLikeCount } : v))
      )
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
      setVideos((prev) =>
        prev.map((v) =>
          v._id === foodId ? { ...v, saveCount: prevSaveCount } : v
        )
      )
    }
  }

  const handleCommentAdded = (foodId, increment = 1) => {
    setVideos((prev) =>
      prev.map((v) =>
        v._id === foodId
          ? { ...v, commentCount: Math.max(0, (v.commentCount ?? 0) + increment) }
          : v
      )
    )
  }

  return (
    <div className="reels-shell">
      <div className="reels-list">
        {savedVideos.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty-icon">🔖</div>
            <div className="saved-empty-title">Nothing saved yet</div>
            <div className="saved-empty-sub">
              Tap the bookmark icon on any dish to save it here.
            </div>
          </div>
        ) : (
          savedVideos.map((reel) => (
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
                  </div>
                  <Link
                    className="reel-visit"
                    to={'/store/' + (reel.merchant?._id || reel.merchant || reel.foodPartner)}
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            </section>
          ))
        )}
      </div>

      {<BottomNav />}
      <CommentsModal
        isOpen={isCommentsOpen}
        foodId={selectedReelId}
        onClose={() => setIsCommentsOpen(false)}
        reelData={videos.find((v) => v._id === selectedReelId)}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  )
}

export default Saved

