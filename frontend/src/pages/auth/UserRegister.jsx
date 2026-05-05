import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'
import BottomNav from '../../components/BottomNav'

export default function UserRegister() {
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    const name = e.target.name.value
    const email = e.target.email.value
    const password = e.target.password.value
    await api.post('/api/auth/user/register', { name, email, password })
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
          <h1 className="auth-head">Create account</h1>
          <p className="auth-sub">Join Cravyo and discover amazing food.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Create a password" />
          </div>
          <button type="submit">Create Account →</button>
          <p className="small-note">
            Already have an account? <Link to="/user/login">Sign in</Link>
          </p>
          <p className="small-note">
            Are you a merchant? <Link to="/food-partner/register">Register as Merchant</Link>
          </p>
        </form>
      </div>
      <BottomNav />
    </div>
  )
}
