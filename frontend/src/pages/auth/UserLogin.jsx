import { Link ,useNavigate } from 'react-router-dom'
import axios from 'axios'
export default function UserLogin() {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email= e.target.email.value;
    const password= e.target.password.value;
    //console.log(email, password);
            const response = await axios.post('http://localhost:1234/api/auth/user/login', { email, password },{withCredentials: true});//withCredentials to store  cookies cookies are used to maintain user sessions and authentication states across different requests. By including this option, the client can send cookies along with the request, allowing the server to recognize the user and maintain their session. This is particularly important for authentication purposes, as it enables the server to identify the user and provide access to protected resources based on their session information.
        //console.log(response.data);
        navigate('/');};
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
