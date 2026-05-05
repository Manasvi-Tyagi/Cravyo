import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../../api/axios'
import { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'

export default function FoodPartnerLogin() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const email = e.target.email.value
    const password = e.target.password.value
    try {
      const res = await api.post('/api/auth/merchant/login', { email, password })
      const merchant = res.data?.data
      if (merchant?.id != null) {
        localStorage.setItem(FOOD_PARTNER_ID_KEY, String(merchant.id))
      }
      navigate('/food-partner/home', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Is the API running?')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-logo">Cravyo</div>
        <div className="auth-brand-tagline">Merchant Portal</div>
      </div>

      <div className="auth-card">
        <div className="auth-head-row">
          <h1 className="auth-head">Merchant Sign In</h1>
          <p className="auth-sub">Sign in to manage your restaurant dashboard.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="restaurant@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Your password" />
          </div>
          <button type="submit">Sign In →</button>
          {error && <p className="small-note" role="alert" style={{ color: '#f87171' }}>{error}</p>}
          <p className="small-note">
            New merchant? <Link to="/food-partner/register">Register restaurant</Link>
          </p>
          <p className="small-note">
            Customer? <Link to="/user/login">Customer Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
