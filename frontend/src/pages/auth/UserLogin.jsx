import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'
import BottomNav from '../../components/BottomNav'

export default function UserLogin() {
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value
    await api.post('/api/auth/user/login', { email, password })
    localStorage.removeItem(FOOD_PARTNER_ID_KEY)
    navigate('/')
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-logo">Cravyo</div>
        <div className="auth-brand-tagline">Discover food like never before</div>
      </div>

      <div className="auth-card">
        <div className="auth-head-row">
          <h1 className="auth-head">Welcome back</h1>
          <p className="auth-sub">Sign in to continue ordering meals.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Your password" />
          </div>
          <button type="submit">Sign In →</button>
          <p className="small-note">
            New here? <Link to="/user/register">Create account</Link>
          </p>
          <p className="small-note">
            Are you a merchant? <Link to="/food-partner/login">Merchant Sign In</Link>
          </p>
        </form>
      </div>
      <BottomNav />
    </div>
  )
}
