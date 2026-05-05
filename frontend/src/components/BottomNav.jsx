import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import api from '../api/axios'

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

function CartGlyph({ active }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={active ? '#FF6B35' : 'currentColor'} strokeWidth="1.8" strokeLinejoin="round"/>
      <line x1="3" y1="6" x2="21" y2="6" stroke={active ? '#FF6B35' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 10a4 4 0 01-8 0" stroke={active ? '#FF6B35' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
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

export default function BottomNav() {
  const location = useLocation()
  const [currentUser, setCurrentUser] = React.useState(undefined)

  const homeActive = location.pathname === '/'
  const savedActive = location.pathname.startsWith('/saved')
  const cartActive = location.pathname.startsWith('/cart')
  const profileActive = location.pathname.startsWith('/user') || location.pathname.startsWith('/orders')

  React.useEffect(() => {
    api.get('/api/auth/user/me')
      .then(res => setCurrentUser(res.data.data))
      .catch(() => setCurrentUser(null))
  }, [])

  const profileLink = currentUser ? '/orders' : '/user/login'
  const profileLabel = currentUser ? (currentUser.name?.split(' ')[0] || 'profile') : 'login'

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

      <NavLink to={profileLink} className={profileActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
        <ProfileGlyph active={profileActive} />
        <span className="bottom-nav-label">{profileLabel}</span>
      </NavLink>
    </nav>
  )
}
