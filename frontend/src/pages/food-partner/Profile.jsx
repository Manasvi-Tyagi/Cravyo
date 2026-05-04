import React from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import FoodPartnerBottomNav, { FOOD_PARTNER_ID_KEY } from "../../components/FoodPartnerBottomNav";

const Profile = () => {
  const { id } = useParams();
  const [partnerOwnProfile, setPartnerOwnProfile] = React.useState(false);
  const [profileData, setProfileData] = React.useState(null);
  const [videoPosts, setVideoPosts] = React.useState([]);

  React.useEffect(() => {
    api.get(`/api/merchant/${id}`)
      .then((response) => {
        const data = response.data.data;
        setProfileData(data.merchant);
        setVideoPosts(data.products || []);
      });
  }, [id]);

  React.useEffect(() => {
    // Only check merchant ownership if the viewer has a merchant session in localStorage.
    // Avoids a noisy 401 when a regular customer views the store page.
    const storedMerchantId = localStorage.getItem(FOOD_PARTNER_ID_KEY);
    if (!storedMerchantId) {
      setPartnerOwnProfile(false);
      return;
    }
    // Quick local check first — avoids network call in most cases
    if (String(storedMerchantId) === String(id)) {
      // Verify with server to confirm session is still valid
      api.get("/api/auth/merchant/me")
        .then((res) => {
          const same = String(res.data.data?.id) === String(id);
          setPartnerOwnProfile(same);
        })
        .catch(() => setPartnerOwnProfile(false));
    } else {
      setPartnerOwnProfile(false);
    }
  }, [id]);

  return (
    <div
      className="profile-page"
      style={
        partnerOwnProfile
          ? {
              paddingBottom:
                "calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))",
            }
          : undefined
      }
    >
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
            
                <video className="video-tile" style={{ width: '100%',objectFit: 'cover', }} src={post.videoUrl || post.video}  muted />
            
          </div>
        ))}
      </div>
      {partnerOwnProfile ? <FoodPartnerBottomNav /> : null}
    </div>
  );
}

export default Profile;
