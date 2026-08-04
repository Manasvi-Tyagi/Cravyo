import React from 'react'
import { Link } from 'react-router-dom'

export default function SavedProductCard({ product, onOpenComments, onRemove, removing }) {
  const merchant = product.merchant
  const merchantId = typeof merchant === 'object' ? merchant?._id : merchant
  const merchantName = merchant?.restaurantName || merchant?.name

  return (
    <div className={['saved-card', removing ? 'saved-card--removing' : ''].filter(Boolean).join(' ')}>
      {(product.videoUrl || product.video) ? (
        <video className="saved-card-thumb" src={product.videoUrl || product.video} muted playsInline preload="metadata" />
      ) : (
        <div className="saved-card-thumb" aria-hidden="true" />
      )}
      <div className="saved-card-body">
        <div className="saved-card-name">{product.name}</div>
        {merchantId ? (
          <Link className="saved-card-merchant" to={`/store/${merchantId}`}>{merchantName}</Link>
        ) : (
          <span className="saved-card-merchant">{merchantName}</span>
        )}
        {product.price != null && <div className="saved-card-price">₹{product.price}</div>}
        <div className="saved-card-meta">
          <span>♥ {product.likeCount ?? 0}</span>
          <button type="button" className="saved-card-meta-btn" onClick={onOpenComments}>💬 {product.commentCount ?? 0}</button>
          <button type="button" className="saved-card-remove" onClick={onRemove}>Remove</button>
        </div>
      </div>
    </div>
  )
}
