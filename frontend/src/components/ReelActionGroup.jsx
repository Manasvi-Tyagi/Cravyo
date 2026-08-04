import React from 'react'
import { Link } from 'react-router-dom'

function HeartIcon({ filled }) {
  return (
    <svg className="action-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-7-4.6-9.3-8.5C.6 9.1 2.3 5.9 5.6 5.2c1.7-.4 3.4.2 4.4 1.5 1-1.3 2.7-1.9 4.4-1.5 3.3.7 5 3.9 2.9 7.3C19 16.4 12 21 12 21Z"
        fill={filled ? 'currentColor' : 'transparent'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg className="action-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 18l-3 3V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7Z" fill="transparent" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function BookmarkIcon({ filled }) {
  return (
    <svg className="action-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1Z"
        fill={filled ? 'currentColor' : 'transparent'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg className="action-svg" viewBox="0 0 24 24" aria-hidden="true" style={{ width: 18, height: 18 }}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Vertical rail: like, comment, save, add-to-cart, visit-store.
 * All actions render for signed-out visitors too — gating happens on tap (see onGatedAction in parent).
 */
export default function ReelActionGroup({
  liked,
  likeCount,
  onToggleLike,
  heartBeat,
  commentCount,
  onOpenComments,
  saved,
  saveCount,
  onToggleSave,
  cartAdded,
  onAddToCart,
  merchantId,
  merchantImage,
}) {
  return (
    <div className="reel-actions" aria-label="Reel actions">
      <div className="action-stack">
        <button
          className={['action-btn', liked ? 'active like-active' : '', heartBeat ? 'heart-beat' : ''].filter(Boolean).join(' ')}
          onClick={onToggleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
          aria-pressed={liked}
          type="button"
        >
          <HeartIcon filled={liked} />
        </button>
        <div className="action-count">{likeCount ?? 0}</div>
      </div>

      <div className="action-stack">
        <button className="action-btn" type="button" aria-label="Open comments" onClick={onOpenComments}>
          <CommentIcon />
        </button>
        <div className="action-count">{commentCount ?? 0}</div>
      </div>

      <div className="action-stack">
        <button
          className={['action-btn', saved ? 'active save-active' : ''].filter(Boolean).join(' ')}
          onClick={onToggleSave}
          aria-label={saved ? 'Remove from saved' : 'Save'}
          aria-pressed={saved}
          type="button"
        >
          <BookmarkIcon filled={saved} />
        </button>
        <div className="action-count">{saveCount ?? 0}</div>
      </div>

      <button
        className={['action-btn-cart', cartAdded ? 'cart-added' : ''].filter(Boolean).join(' ')}
        onClick={onAddToCart}
        aria-label={cartAdded ? 'Added to cart' : 'Add to cart'}
        type="button"
      >
        <CartIcon />
      </button>

      {merchantId && (
        <Link to={`/store/${merchantId}`} aria-label="Visit store">
          {merchantImage ? (
            <img className="action-btn-avatar" src={merchantImage} alt="" />
          ) : (
            <span className="action-btn-avatar" aria-hidden="true" />
          )}
        </Link>
      )}
    </div>
  )
}
