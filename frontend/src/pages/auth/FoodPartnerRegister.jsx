import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
export default function FoodPartnerRegister() {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const contactName = e.target.contactName.value;
    const address = e.target.address.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;
    console.log(name, contactName, address, email, phone, password);
    const response = await axios.post(
      "http://localhost:1234/api/auth/food-partner/register",
      { name, contactName, address, email, phone, password },
      { withCredentials: true },
    ); //withCredentials to store  cookies cookies are used to maintain user sessions and authentication states across different requests. By including this option, the client can send cookies along with the request, allowing the server to recognize the user and maintain their session. This is particularly important for authentication purposes, as it enables the server to identify the user and provide access to protected resources based on their session information.
    console.log(response.data);
    navigate("/create-food");
  };
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head-row">
          <div>
            <h1 className="auth-head">Food Partner Register</h1>
            <p className="auth-sub">
              Join as a partner and receive orders in real time.
            </p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kitchen / Restaurant Name</label>
            <input name="name" placeholder="Your kitchen name" />
          </div>
          <div className="form-group">
            <label>Contact Name</label>
            <input name="contactName" placeholder="Contact person name" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input name="address" placeholder="Street, city, pincode" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="partner@example.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" placeholder="+91 98765 43210" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Set a strong password" />
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
  );
}
