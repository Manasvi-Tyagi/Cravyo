import { Link ,useNavigate} from 'react-router-dom'
import { useState } from 'react'
import api from '../../api/axios'
import { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'

export default function FoodPartnerLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('')
    const email= e.target.email.value;
    const password= e.target.password.value;
    try {
      const res = await api.post('/api/auth/merchant/login', { email, password });
      const merchant = res.data?.data
      if (merchant?.id != null) {
        localStorage.setItem(FOOD_PARTNER_ID_KEY, String(merchant.id))
      }
      navigate('/food-partner/home', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Is the API running?'
      setError(msg)
    }
  }
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head-row">
          <div>
            <h1 className="auth-head">Food Partner Login</h1>
            <p className="auth-sub">Sign in to manage your partner dashboard.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="partner@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Your password" />
          </div>
          <button type="submit">Login</button>
          {error ? <p className="small-note" role="alert" style={{ color: '#f87171' }}>{error}</p> : null}
          <p className="small-note">
            New partner? <Link to="/food-partner/register">Register</Link>
          </p>
          <p className="small-note">
            <Link to="/user/login">User Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
