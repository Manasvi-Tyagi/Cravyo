import { Link } from 'react-router-dom'

export default function UserLogin() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head-row">
          <div>
            <h1 className="auth-head">User Login</h1>
            <p className="auth-sub">Sign in to continue ordering meals.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Your password" />
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
