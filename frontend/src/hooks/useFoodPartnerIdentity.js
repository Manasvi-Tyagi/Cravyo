import React from 'react'
import api from '../api/axios'

export const FOOD_PARTNER_ID_KEY = 'merchantId'

export function useFoodPartnerIdentity() {
  const [partner, setPartner] = React.useState(() => {
    const id = localStorage.getItem(FOOD_PARTNER_ID_KEY)
    return id ? { id } : null
  })

  React.useEffect(() => {
    api
      .get('/api/auth/merchant/me')
      .then((res) => {
        const data = res.data.data || {}
        const id = String(data.id)
        localStorage.setItem(FOOD_PARTNER_ID_KEY, id)
        setPartner({ id, restaurantName: data.restaurantName, name: data.name })
      })
      .catch(() => {
        localStorage.removeItem(FOOD_PARTNER_ID_KEY)
        setPartner(null)
      })
  }, [])

  return partner
}
