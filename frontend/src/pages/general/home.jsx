import React from 'react'
import axios from 'axios'
import { Link ,useNavigate } from 'react-router-dom'
// const reels = [
//   {
//     id: 1,
//     title: 'Spicy Tikka Drop',
//     description: 'Fresh tikka wraps with house chutney and crunchy onions. Limited time special for today only.',
//     url: 'https://ik.imagekit.io/mnsv7/f96ca4c8-eba3-45d5-9346-e0a9749290ce-12888314_1080_1920_30fps_QwTE1CvS6.mp4',
//     store: '/food-partner/login',
//   },
//   {
//     id: 2,
//     title: 'Sizzling Paneer Bowl',
//     description: 'Creamy paneer, peppers, and spicy drizzle served hot. Perfect for quick dinners and weekend cravings.',
//     url: 'https://ik.imagekit.io/mnsv7/f96ca4c8-eba3-45d5-9346-e0a9749290ce-12888314_1080_1920_30fps_QwTE1CvS6.mp4',
//     store: '/food-partner/login',
//   },
//   {
//     id: 3,
//     title: 'Mango Shake Joy',
//     description: 'Chilled mango shake with fresh fruit and aromatic cardamom. A cool treat after a busy day.',
//     url: 'https://ik.imagekit.io/mnsv7/f96ca4c8-eba3-45d5-9346-e0a9749290ce-12888314_1080_1920_30fps_QwTE1CvS6.mp4',
//     store: '/food-partner/login',
//   },
// ]

const Home = () => {
  const [videos, setVideos] = React.useState([]);
  const videoRefs = React.useRef(new Map());
  const containerRef = React.useRef(null);
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (video) {
            if (entry.isIntersecting) {
              video.play();
            } else {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    videoRefs.current.forEach((video) => observer.observe(video));
    return () => {
      videoRefs.current.forEach((video) => observer.unobserve(video));
    };
  }, [videos]);


  React.useEffect(() => {
    axios.get('http://localhost:1234/api/food/',{withCredentials: true}).then((response) => {
      setVideos(response.data.food);
    });
  }); 
  const setVideoRef = (id) => (el) => {
    if (el) {
      videoRefs.current.set(id, el);
    } else {
      videoRefs.current.delete(id);
      return 
    }
  };  
  

  return (
    <div className="reels-shell">
      <div className="reels-list">
        {videos.map((reel) => (
          <section className="reel-item" key={reel._id}>
            <video
              src={reel.video}
              ref={setVideoRef(reel._id)}
              className="reel-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="reel-overlay">
              <div>
                <div className="reel-title">{reel.title}</div>
                <div className="reel-description">{reel.description}</div>
              </div>
              <Link className="reel-visit" to={"/food-partner/"+reel.foodPartner} >
                Visit Store
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Home