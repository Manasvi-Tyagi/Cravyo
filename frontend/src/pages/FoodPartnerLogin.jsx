import { Link } from 'react-router-dom'

export default function FoodPartnerLogin() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head-row">
          <div>
            <h1 className="auth-head">Food Partner Login</h1>
            <p className="auth-sub">Sign in to manage your partner dashboard.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="partner@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Your password" />
          </div>
          <button type="submit">Login</button>
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
