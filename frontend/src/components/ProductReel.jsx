import React from 'react'
import { Link } from 'react-router-dom'
import ReelActionGroup from './ReelActionGroup'

export default function ProductReel({
  product,
  videoRef,
  liked,
  saved,
  cartAdded,
  heartBeat,
  onToggleLike,
  onToggleSave,
  onAddToCart,
  onOpenComments,
}) {
  const [videoFailed, setVideoFailed] = React.useState(false)
  const [reloadKey, setReloadKey] = React.useState(0)
  const merchant = product.merchant
  const merchantId = typeof merchant === 'object' ? merchant?._id : merchant
  const merchantName = merchant?.restaurantName || merchant?.name

  return (
    <section className="reel-item" data-reel-id={product._id}>
      {videoFailed ? (
        <div className="reel-video-error">
          <span className="state-icon round" aria-hidden="true">!</span>
          <p>This video couldn't load</p>
          <button
            type="button"
            className="btn btn-sm btn-secondary reel-video-retry"
            onClick={() => { setVideoFailed(false); setReloadKey((k) => k + 1) }}
          >
            Retry
          </button>
        </div>
      ) : (
        <video
          key={reloadKey}
          src={product.videoUrl || product.video}
          ref={videoRef}
          className="reel-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
        />
      )}

      <ReelActionGroup
        liked={liked}
        likeCount={product.likeCount}
        onToggleLike={onToggleLike}
        heartBeat={heartBeat}
        commentCount={product.commentCount}
        onOpenComments={onOpenComments}
        saved={saved}
        saveCount={product.saveCount}
        onToggleSave={onToggleSave}
        cartAdded={cartAdded}
        onAddToCart={onAddToCart}
        merchantId={merchantId}
        merchantImage={merchant?.image}
      />

      <div className="reel-overlay">
        <div className="reel-overlay-inner">
          <div className="reel-info">
            {merchantId && (
              <Link className="reel-merchant-tag" to={`/store/${merchantId}`}>
                {merchant?.image ? (
                  <img className="reel-merchant-avatar" src={merchant.image} alt="" />
                ) : (
                  <span className="reel-merchant-avatar" aria-hidden="true" />
                )}
                {merchantName}
                <span className="reel-merchant-chevron" aria-hidden="true">›</span>
              </Link>
            )}
            <div className="reel-title">{product.name}</div>
            {product.description && <div className="reel-description">{product.description}</div>}
            {product.price != null && <div className="reel-price">₹{product.price}</div>}
            <button
              className={['reel-add-cart', cartAdded ? 'cart-added' : ''].filter(Boolean).join(' ')}
              onClick={onAddToCart}
              type="button"
            >
              {cartAdded ? '✓ Added to cart' : '🛒 Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
