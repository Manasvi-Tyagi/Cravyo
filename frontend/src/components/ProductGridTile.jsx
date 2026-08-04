import React from 'react'

export default function ProductGridTile({ product, onClick, showPrice = false }) {
  return (
    <button
      type="button"
      className="grid-tile"
      onClick={onClick}
      aria-label={`Open ${product.name || 'food reel'}`}
    >
      {(product.videoUrl || product.video) ? (
        <video className="grid-tile-video" src={product.videoUrl || product.video} muted playsInline preload="metadata" />
      ) : (
        <div className="grid-tile-video grid-tile-video--missing" aria-hidden="true">▶</div>
      )}
      {showPrice && product.price != null && <span className="grid-tile-price">₹{product.price}</span>}
      <span className="grid-tile-play" aria-hidden="true">▶</span>
      <span className="grid-tile-label">{product.name}</span>
    </button>
  )
}
