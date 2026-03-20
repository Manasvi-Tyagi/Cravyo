import React, { useState } from 'react';
import '../../styles/create-food.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateFood = () => {
  const [foodName, setFoodName] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const navigate=useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Food Name:', foodName);
    console.log('Video File:', videoFile);
    console.log('Description:', description);
    // Here you would typically send to backend
    const formData=new FormData();
    formData.append('name',foodName)
    formData.append('description',description)
    formData.append('videos',videoFile)
    const response=await axios.post("http://localhost:1234/api/food/",formData,{withCredentials:true})
    console.log(response.data)
    navigate('/')

  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  React.useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div className="create-food-shell">
      <div className="create-food-card">
        <h1 className="create-food-head">Create New Food Item</h1>
        <p className="create-food-sub">Share your delicious creation with the world</p>

        <form className="create-food-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="foodName">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM12 4V5H12V4ZM8 7V19H16V7H8Z" fill="currentColor"/>
              </svg>
              Food Name
            </label>
            <input
              type="text"
              id="foodName"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Enter food name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="videoFile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z" fill="currentColor"/>
              </svg>
              Video File
            </label>
            <div className={`file-upload-area ${isDragOver ? 'drag-over' : ''} ${videoFile ? 'has-file' : ''}`} onClick={() => videoFile ? setShowVideoModal(true) : document.getElementById('videoFile').click()} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <input
                type="file"
                id="videoFile"
                accept="video/*"
                onChange={handleFileChange}
                className="file-input-hidden"
                required
              />
              <div className="upload-content">
                {videoFile ? (
                  <div className="video-thumbnail-container">
                    <div className="video-thumbnail">
                      <video src={videoUrl} className="thumbnail-video" muted />
                      <div className="thumbnail-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5v14l11-7z" fill="white"/>
                        </svg>
                        <span>Preview</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="upload-icon">
                      <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z" fill="currentColor" opacity="0.5"/>
                    </svg>
                    <div className="upload-text">
                      <span className="upload-primary">Click to upload video</span>
                      <span className="upload-secondary">or drag and drop</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
              </svg>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your food item..."
              rows="4"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={!foodName || !videoFile || !description}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            Create Food Item
          </button>
        </form>

        {showVideoModal && (
          <div className="video-modal-overlay" onClick={() => setShowVideoModal(false)}>
            <div className="video-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Video Preview</h3>
                <div className="modal-actions">
                  <button className="change-video-btn" onClick={() => { setShowVideoModal(false); document.getElementById('videoFile').click(); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                    Change Video
                  </button>
                  <button className="close-modal" onClick={() => setShowVideoModal(false)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="modal-body">
                <video controls src={videoUrl} className="modal-video" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFood;