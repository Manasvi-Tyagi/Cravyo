# 🍽️ Cravyo - Reel-Based Food Discovery Platform

Cravyo is a full-stack food discovery platform inspired by Instagram Reels, designed to help users discover restaurants and dishes through engaging short-form videos. It enables customers to browse food reels, interact with content, and order food, while allowing food partners to showcase their dishes and manage their restaurant profiles.

The project follows a hybrid database architecture where **MySQL** is used for structured authentication data and **MongoDB** is used for highly scalable social media content such as reels, likes, comments, and carts. This architecture combines the strengths of both relational and NoSQL databases while maintaining scalability and performance.

---

# 🚀 Features

## 👤 Customer

- Register and Login
- Secure JWT Authentication
- Browse Food Reels
- Infinite Scroll Feed
- Like Reels
- Comment on Reels
- Save Reels
- Search Food & Restaurants
- Add Food to Cart
- Place Orders
- Logout

---

## 🏪 Food Partner

- Register and Login
- Secure JWT Authentication
- Upload Food Reels
- Manage Restaurant Profile
- Add Food Items
- View Orders
- Logout

---

# 🏗️ System Architecture

```
                          React Frontend
                                 │
                                 │ REST APIs
                                 ▼
                      Express.js Backend
                                 │
         ┌───────────────────────┴────────────────────────┐
         │                                                │
         ▼                                                ▼
      MySQL                                            MongoDB
(Authentication)                              (Social Content Storage)
         │                                                │
         │                                                │
 Customers                                    Food Reels
 Food Partners                                Likes
                                              Comments
                                              Saved Reels
                                              Cart
                                              Categories

         │
         ▼
 JWT Authentication

         │
         ▼
 Redis Cache

         │
         ▼
 Elasticsearch

         │
         ▼
 ImageKit CDN
```

---

# 💻 Tech Stack

## Frontend

- React.js
- Axios
- React Router DOM
- Tailwind CSS

---

## Backend

- Node.js
- Express.js

---

## Databases

### MySQL

Used for structured relational data.

- Customer Authentication
- Food Partner Authentication

### MongoDB

Used for document-based data.

- Food Reels
- Likes
- Comments
- Saved Reels
- Cart

---

## Authentication

- JWT (JSON Web Tokens)
- HTTP Only Cookies
- bcrypt Password Hashing

---

## Media Storage

- Multer
- ImageKit CDN

---

## Search

- Elasticsearch

---

## Caching

- Redis

---

# 📁 Project Structure

```
backend
│
├── server.js
├── package.json
│
├── src
│
├── app.js
│
├── db
│   ├── mongodb.js
│   └── mysql.js
│
├── controllers
│   ├── auth.controller.js
│   ├── food.controller.js
│   ├── cart.controller.js
│   ├── order.controller.js
│   └── foodPartner.controller.js
│
├── models
│   ├── customer.model.js
│   ├── foodPartner.model.js
│   ├── food.model.js
│   ├── likes.model.js
│   ├── comments.model.js
│   ├── save.model.js
│   ├── cart.model.js
│   └── order.model.js
│
├── routes
│   ├── auth.routes.js
│   ├── food.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   └── foodPartner.routes.js
│
├── middlewares
│   └── auth.middleware.js
│
├── services
│   ├── imagekit.service.js
│   ├── redis.service.js
│   └── elasticsearch.service.js
│
├── utils
│
└── uploads
```

---

# 🗄️ Database Design

## MySQL

### customers

| Column | Type |
|---------|------|
| id | INT |
| name | VARCHAR(100) |
| email | VARCHAR(255) |
| password | VARCHAR(255) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

### food_partners

| Column | Type |
|---------|------|
| id | INT |
| name | VARCHAR(100) |
| contact_name | VARCHAR(100) |
| phone | VARCHAR(20) |
| address | TEXT |
| email | VARCHAR(255) |
| password | VARCHAR(255) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## MongoDB Collections

```
foods
likes
comments
saved_reels
cart
```

---

# 🔐 Authentication Flow

## Customer Registration

```
Customer
      │
      ▼
Enter Details
      │
      ▼
Validate Request
      │
      ▼
Check Existing Email (MySQL)
      │
      ▼
Hash Password using bcrypt
      │
      ▼
Store Customer in MySQL
      │
      ▼
Generate JWT
      │
      ▼
Store JWT in HTTP Only Cookie
      │
      ▼
Registration Successful
```

---

## Customer Login

```
Customer
      │
      ▼
Enter Email & Password
      │
      ▼
Find Customer in MySQL
      │
      ▼
Compare Password using bcrypt
      │
      ▼
Generate JWT
      │
      ▼
Store JWT in Cookie
      │
      ▼
Login Successful
```

---

# 🍔 Food Reel Upload Flow

```
Food Partner
      │
      ▼
Upload Video + Thumbnail
      │
      ▼
Multer Middleware
      │
      ▼
ImageKit Upload
      │
      ▼
Receive Image URLs
      │
      ▼
Store Reel Metadata in MongoDB
      │
      ▼
Food Reel Available
```

---

# ❤️ Like Flow

```
Customer
      │
      ▼
Click Like
      │
      ▼
Verify JWT
      │
      ▼
Store Like in MongoDB
      │
      ▼
Increase Like Count
      │
      ▼
Updated Feed
```

---

# 💬 Comment Flow

```
Customer
      │
      ▼
Write Comment
      │
      ▼
Verify JWT
      │
      ▼
Store Comment in MongoDB
      │
      ▼
Return Updated Comments
```

---

# ⭐ Save Reel Flow

```
Customer
      │
      ▼
Save Reel
      │
      ▼
Verify JWT
      │
      ▼
Store Saved Reel
      │
      ▼
Available in Saved Section
```

---

# 🛒 Cart Flow

```
Customer
      │
      ▼
Add Food Item
      │
      ▼
Verify JWT
      │
      ▼
Store Cart in MongoDB
      │
      ▼
Update Quantity
      │
      ▼
Checkout
```

---

# 🔍 Search Flow

```
Customer
      │
      ▼
Search Dish
      │
      ▼
Elasticsearch
      │
      ▼
Relevant Food Reels
```

---

# 📦 Order Flow

```
Customer
      │
      ▼
Checkout
      │
      ▼
Validate Cart
      │
      ▼
Create Order
      │
      ▼
Notify Food Partner
      │
      ▼
Order Confirmed
```

---

# 📡 REST APIs

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register Customer |
| POST | `/api/auth/login` | Login Customer |
| POST | `/api/auth/logout` | Logout Customer |
| GET | `/api/auth/me` | Current Customer |

---

## Food Partner

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/partner/register` | Register Food Partner |
| POST | `/api/partner/login` | Login Food Partner |
| POST | `/api/partner/logout` | Logout Food Partner |
| GET | `/api/partner/me` | Current Food Partner |

---

## Food APIs

| Method | Endpoint |
|---------|----------|
| GET | `/api/foods` |
| GET | `/api/foods/:id` |
| POST | `/api/foods/upload` |
| PUT | `/api/foods/:id` |
| DELETE | `/api/foods/:id` |

---

## Like APIs

| Method | Endpoint |
|---------|----------|
| POST | `/api/foods/:id/like` |
| DELETE | `/api/foods/:id/like` |

---

## Comment APIs

| Method | Endpoint |
|---------|----------|
| POST | `/api/comments` |
| GET | `/api/comments/:foodId` |
| DELETE | `/api/comments/:id` |

---

## Cart APIs

| Method | Endpoint |
|---------|----------|
| POST | `/api/cart/add` |
| GET | `/api/cart` |
| PATCH | `/api/cart/update` |
| DELETE | `/api/cart/remove/:id` |

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=1234

MONGODB_URI=

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=cravyo
MYSQL_USER=root
MYSQL_PASSWORD=

JWT_SECRET=

REDIS_URL=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

ELASTICSEARCH_NODE=
```

---

# ⚡ Installation

Clone the repository

```bash
git clone https://github.com/yourusername/cravyo.git
```

Move into the project

```bash
cd cravyo
```

Install dependencies

```bash
npm install
```

Run the backend

```bash
npm run dev
```

---

# 🔮 Future Enhancements

- AI-powered automatic food tagging
- Personalized recommendation engine
- Restaurant analytics dashboard
- Real-time notifications
- Payment Gateway Integration
- Order Tracking
- Ratings & Reviews
- Admin Dashboard
- Multi-language Support

---

# 👨‍💻 Author

**Manasvi Tyagi**

**Cravyo – Reel-Based Food Discovery Platform**

Built using **React.js, Node.js, Express.js, MySQL, MongoDB, Redis, Elasticsearch, ImageKit, JWT Authentication, and REST APIs.**
