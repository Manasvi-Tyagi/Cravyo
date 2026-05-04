import React from 'react'
import { NavLink } from 'react-router-dom'
import api from '../api/axios'

export const FOOD_PARTNER_ID_KEY = 'merchantId'

function HomeGlyph({ active }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
        stroke={active ? '#60a5fa' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusGlyph({ active }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={active ? '#60a5fa' : 'currentColor'}
        strokeWidth="1.8"
      />
      <path
        d="M12 8v8M8 12h8"
        stroke={active ? '#60a5fa' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SavedGlyph({ active }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1Z"
        stroke={active ? '#60a5fa' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProfileGlyph({ active }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke={active ? '#60a5fa' : 'currentColor'}
        strokeWidth="1.8"
      />
      <path
        d="M5.5 19.5c.8-4 13.2-4 14 0"
        stroke={active ? '#60a5fa' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function FoodPartnerBottomNav() {
  const [partnerId, setPartnerId] = React.useState(() => localStorage.getItem(FOOD_PARTNER_ID_KEY))

  React.useEffect(() => {
    api
      .get('/api/auth/merchant/me')
      .then((res) => {
        const id = String(res.data.data?.id || res.data.merchant?.id)
        localStorage.setItem(FOOD_PARTNER_ID_KEY, id)
        setPartnerId(id)
      })
      .catch(() => {
        localStorage.removeItem(FOOD_PARTNER_ID_KEY)
        setPartnerId(null)
      })
  }, [])

  const profileTo = partnerId ? `/food-partner/${partnerId}` : ''

  return (
    <nav className="bottom-nav bottom-nav-partner" aria-label="Partner navigation">
      <NavLink
        to="/food-partner/home"
        end
        className={({ isActive }) =>
          isActive ? 'bottom-nav-link active' : 'bottom-nav-link'
        }
      >
        {({ isActive }) => (
          <>
            <HomeGlyph active={isActive} />
            <span className="bottom-nav-label">home</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/create-food"
        className={({ isActive }) =>
          isActive ? 'bottom-nav-link active' : 'bottom-nav-link'
        }
      >
        {({ isActive }) => (
          <>
            <PlusGlyph active={isActive} />
            <span className="bottom-nav-label">create</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/saved"
        className={({ isActive }) =>
          isActive ? 'bottom-nav-link active' : 'bottom-nav-link'
        }
      >
        {({ isActive }) => (
          <>
            <SavedGlyph active={isActive} />
            <span className="bottom-nav-label">saved</span>
          </>
        )}
      </NavLink>

      {partnerId ? (
        <NavLink
          to={profileTo}
          end
          className={({ isActive }) =>
            isActive ? 'bottom-nav-link active' : 'bottom-nav-link'
          }
        >
          {({ isActive }) => (
            <>
              <ProfileGlyph active={isActive} />
              <span className="bottom-nav-label">profile</span>
            </>
          )}
        </NavLink>
      ) : (
        <span
          className="bottom-nav-link bottom-nav-link--idle"
          aria-label="profile (loading)"
        >
          <ProfileGlyph active={false} />
          <span className="bottom-nav-label">profile</span>
        </span>
      )}
    </nav>
  )
}
