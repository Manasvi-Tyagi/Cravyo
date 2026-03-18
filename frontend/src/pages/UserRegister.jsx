import { Link } from 'react-router-dom'

export default function UserRegister() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head-row">
          <div>
            <h1 className="auth-head">User Register</h1>
            <p className="auth-sub">Create your account to order food quickly.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Name</label>
            <input placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Create a password" />
          </div>
          <button type="submit">Create Account</button>
          <p className="small-note">
            Already have an account? <Link to="/user/login">Login</Link>
          </p>
          <p className="small-note">
            <Link to="/food-partner/register">Register as Food Partner</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
