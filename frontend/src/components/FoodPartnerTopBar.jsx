import React from 'react'
import { NavLink } from 'react-router-dom'
import { useFoodPartnerIdentity } from '../hooks/useFoodPartnerIdentity'

const linkClass = ({ isActive }) => (isActive ? 'bottom-nav-link active' : 'bottom-nav-link')

/** Sticky dark identity strip — must render as the first element on the page for `position: sticky; top: 0` to dock correctly. */
export default function FoodPartnerTopBar() {
  const partner = useFoodPartnerIdentity()
  const profileTo = partner ? `/food-partner/${partner.id}` : ''

  return (
    <div className="partner-topbar">
      <div className="partner-topbar-identity">
        <div className="partner-topbar-logo" />
        <span className="partner-topbar-name">{partner?.restaurantName || partner?.name || 'Cravyo Food Partner'}</span>
        <span className="partner-role-chip">FOOD PARTNER</span>
      </div>
      <nav className="partner-topbar-links" aria-label="Food Partner navigation">
        <NavLink to="/food-partner/home" end className={linkClass}>Home</NavLink>
        <NavLink to="/merchant/orders" className={linkClass}>Orders</NavLink>
        {partner ? (
          <NavLink to={profileTo} end className={linkClass}>Profile</NavLink>
        ) : (
          <span className="bottom-nav-link bottom-nav-link--idle">Profile</span>
        )}
      </nav>
      <NavLink to="/create-food" className="btn btn-sm partner-topbar-create">＋ Add product</NavLink>
    </div>
  )
}
