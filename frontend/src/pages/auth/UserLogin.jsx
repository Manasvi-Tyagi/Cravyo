import { Link ,useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { FOOD_PARTNER_ID_KEY } from '../../components/FoodPartnerBottomNav'

export default function UserLogin() {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email= e.target.email.value;
    const password= e.target.password.value;
    await api.post('/api/auth/user/login', { email, password });
    localStorage.removeItem(FOOD_PARTNER_ID_KEY)
    navigate('/');
  };
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head-row">
          <div>
            <h1 className="auth-head">User Login</h1>
            <p className="auth-sub">Sign in to continue ordering meals.</p>
          </div>
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
          <button type="submit">Login</button>
          <p className="small-note">
            New user? <Link to="/user/register">Register</Link>
          </p>
          <p className="small-note">
            <Link to="/food-partner/login">Food Partner Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
