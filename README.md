# Cravyo
# 🍽️ Online Reel-Style Food Ordering Application

A modern food ordering platform inspired by Instagram Reels, where users discover food through short videos and explore food partners seamlessly.

---

## 🚀 Features

### 🎥 Reel-Based Food Discovery

* Full-screen vertical scrolling feed (like Instagram Reels)
* Auto play / pause using Intersection Observer
* Smooth scroll snapping experience

### 🍔 Food Partner Features

* Upload food items with video
* Add title and description
* Dedicated profile page
* Grid view of all uploaded items

### 👤 User Features

* Browse food reels
* Visit food partner profiles
* Like food items
* Clean and smooth UI experience

### 🔐 Authentication

* Separate login/register for:

  * Food Partners
  * Customers
* Protected routes using middleware

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Custom CSS

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Multer

### Storage

* ImageKit (for video hosting)

---

## 📁 Project Structure

frontend/
src/
pages/
auth/
food-partner/
general/
styles/

backend/
src/
controllers/
models/
routes/
middlewares/
services/

---

## ⚙️ Installation

### 1. Clone repository

git clone https://github.com/Manasvi-Tyagi/cravyo.git
cd cravyo

---

### 2. Install dependencies

Backend:
cd backend
npm install

Frontend:
cd frontend
npm install

---

### 3. Setup environment variables

Create `.env` inside backend:

PORT=1234
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_key
IMAGEKIT_URL_ENDPOINT=your_url

---

### 4. Run project

Backend:
npm run dev

Frontend:
npm run dev

---

## 📸 UI Highlights

* Full-screen reels experience
* Instagram-style profile grid
* Minimal and clean design
* Smooth scrolling animations

---

## 💡 Future Improvements

* Comments system
* Order placement
* Save / bookmark feature
* Recommendation system
* Location-based discovery

---

## 👨‍💻 Author

Manasvi Tyagi
