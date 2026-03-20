import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = React.useState(null);
  const [videoPosts, setVideoPosts] = React.useState([]);

    React.useEffect(() => {
        axios.get(`http://localhost:1234/api/food-partner/${id}`, { withCredentials: true })
            .then((response) => {
                // console.log("Profile Data:", response.data);
                console.log(response.data);
                setProfileData(response.data.foodPartner);
                setVideoPosts(response.data.foodPartner.foodItems);
            });
    }, [id]);

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-top-row">
          <div  aria-label="business avatar" ><img className="profile-avatar" src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D" alt="lala" /></div>
          <div className="profile-business">
            <div className="profile-biz-name">{profileData?.name}</div>
            <div className="profile-biz-address">{profileData?.address}</div>
          </div>
        </div>

        <div className="profile-stats-row">
          <div className="profile-stat">
            <div className="stat-label">Total Items</div>
            <div className="stat-value">{profileData?.totalItems}<h1>0</h1></div>
          </div>
          <div className="profile-stat">
            <div className="stat-label">Customer Served</div>
            <div className="stat-value">{profileData?.customerServed}<h1>0</h1></div>
          </div>
        </div>
      </div>

      <div className="profile-videos" aria-label="video grid">
        {videoPosts.map((post) => (
          <div className="video-tile" key={post._id}>
            
                <video className="video-tile" style={{ width: '100%',objectFit: 'cover', }} src={post.video}  muted />
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
