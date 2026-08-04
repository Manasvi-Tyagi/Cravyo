import React from 'react'

export default function MerchantIdentityBlock({ merchant }) {
  const displayName = merchant?.restaurantName || merchant?.name || '—'
  const initial = displayName.trim().charAt(0).toUpperCase()

  return (
    <div className="profile-identity-card">
      {merchant?.image ? (
        <img className="profile-avatar" src={merchant.image} alt="" />
      ) : (
        <div className="profile-avatar" aria-hidden="true">{initial}</div>
      )}
      <div>
        <div className="profile-biz-name">{displayName}</div>
        {merchant?.name && merchant?.restaurantName && (
          <div className="profile-biz-owner">Owner: {merchant.name}</div>
        )}
        {merchant?.address && <div className="profile-biz-address">📍 {merchant.address}</div>}
      </div>
    </div>
  )
}
