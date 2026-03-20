import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'



export default function UserRegister() {
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        //const formData = new FormData(e.target);
        // const userData = {
           const name= e.target.name.value;
            const email= e.target.email.value;
            const password= e.target.password.value;
        //};
        //console.log(name, email, password);
        const response = await axios.post('http://localhost:1234/api/auth/user/register', { name, email, password },{withCredentials: true});//withCredentials to store  cookies cookies are used to maintain user sessions and authentication states across different requests. By including this option, the client can send cookies along with the request, allowing the server to recognize the user and maintain their session. This is particularly important for authentication purposes, as it enables the server to identify the user and provide access to protected resources based on their session information.
        //console.log(response.data);
        navigate('/');
    };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head-row">
          <div>
            <h1 className="auth-head">User Register</h1>
            <p className="auth-sub">Create your account to order food quickly.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
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
