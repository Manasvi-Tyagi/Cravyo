import { Link } from 'react-router-dom'

export default function FoodPartnerRegister() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head-row">
          <div>
            <h1 className="auth-head">Food Partner Register</h1>
            <p className="auth-sub">Join as a partner and receive orders in real time.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Kitchen / Restaurant Name</label>
            <input placeholder="Your kitchen name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="partner@example.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input placeholder="+91 98765 43210" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Set a strong password" />
          </div>
          <button type="submit">Create Partner Account</button>
          <p className="small-note">
            Already have account? <Link to="/food-partner/login">Login</Link>
          </p>
          <p className="small-note">
            <Link to="/user/register">User Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
