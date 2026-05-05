import React from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'
import FoodPartnerBottomNav, { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'

const HERO_PLACEHOLDER = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&auto=format&fit=crop&q=60'

const Profile = () => {
  const { id } = useParams()
  const [partnerOwnProfile, setPartnerOwnProfile] = React.useState(false)
  const [profileData, setProfileData] = React.useState(null)
  const [videoPosts, setVideoPosts] = React.useState([])

  React.useEffect(() => {
    api.get(`/api/merchant/${id}`)
      .then(response => {
        const data = response.data.data
        setProfileData(data.merchant)
        setVideoPosts(data.products || [])
      })
      .catch(() => {})
  }, [id])

  React.useEffect(() => {
    const storedMerchantId = localStorage.getItem(FOOD_PARTNER_ID_KEY)
    if (!storedMerchantId) { setPartnerOwnProfile(false); return }
    if (String(storedMerchantId) === String(id)) {
      api.get('/api/auth/merchant/me')
        .then(res => setPartnerOwnProfile(String(res.data.data?.id) === String(id)))
        .catch(() => setPartnerOwnProfile(false))
    } else {
      setPartnerOwnProfile(false)
    }
  }, [id])

  return (
    <div
      className="profile-page"
      style={partnerOwnProfile
        ? { paddingBottom: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))' }
        : undefined}
    >
      {/* Hero banner */}
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <img
            className="profile-avatar"
            src={HERO_PLACEHOLDER}
            alt={profileData?.restaurantName || profileData?.name || 'Restaurant'}
          />
        </div>
      </div>

      <div className="profile-card">
        {/* Identity */}
        <div className="profile-identity">
          <div className="profile-biz-name">
            {profileData?.restaurantName || profileData?.name || '—'}
          </div>
          {profileData?.address && (
            <div className="profile-biz-address">📍 {profileData.address}</div>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <div className="stat-label">Menu Items</div>
            <div className="stat-value">{videoPosts.length}</div>
          </div>
          <div className="profile-stat">
            <div className="stat-label">Total Likes</div>
            <div className="stat-value">
              {videoPosts.reduce((s, p) => s + (p.likeCount || 0), 0)}
            </div>
          </div>
          <div className="profile-stat">
            <div className="stat-label">Total Saves</div>
            <div className="stat-value">
              {videoPosts.reduce((s, p) => s + (p.saveCount || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Video grid */}
      <div className="profile-videos" aria-label="product grid">
        {videoPosts.map(post => (
          <div className="video-tile" key={post._id}>
            <video
              src={post.videoUrl || post.video}
              muted
              preload="metadata"
            />
            <div className="video-tile-overlay">
              {post.price && <span className="video-tile-price">₹{post.price}</span>}
            </div>
          </div>
        ))}
      </div>

      {partnerOwnProfile && <FoodPartnerBottomNav />}
    </div>
  )
}

export default Profile
