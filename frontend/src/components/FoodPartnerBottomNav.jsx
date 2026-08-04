import React from 'react'
import { NavLink } from 'react-router-dom'
import { useFoodPartnerIdentity } from '../hooks/useFoodPartnerIdentity'

export { FOOD_PARTNER_ID_KEY } from '../hooks/useFoodPartnerIdentity'

function HomeGlyph() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function OrdersGlyph() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ProfileGlyph() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 19.5c.8-4 13.2-4 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/** Fixed dark bottom tab strip (mobile only — hidden on desktop, where FoodPartnerTopBar carries the nav links). */
export default function FoodPartnerBottomNav() {
  const partner = useFoodPartnerIdentity()
  const profileTo = partner ? `/food-partner/${partner.id}` : ''
  const linkClass = ({ isActive }) => (isActive ? 'bottom-nav-link active' : 'bottom-nav-link')

  return (
    <nav className="bottom-nav bottom-nav-partner" aria-label="Food Partner navigation">
      <NavLink to="/food-partner/home" end className={linkClass}>
        <HomeGlyph />
        <span className="bottom-nav-label">home</span>
      </NavLink>

      <NavLink to="/merchant/orders" className={linkClass}>
        <OrdersGlyph />
        <span className="bottom-nav-label">orders</span>
      </NavLink>

      {partner ? (
        <NavLink to={profileTo} end className={linkClass}>
          <ProfileGlyph />
          <span className="bottom-nav-label">profile</span>
        </NavLink>
      ) : (
        <span className="bottom-nav-link bottom-nav-link--idle" aria-label="profile (loading)">
          <ProfileGlyph />
          <span className="bottom-nav-label">profile</span>
        </span>
      )}
    </nav>
  )
}
