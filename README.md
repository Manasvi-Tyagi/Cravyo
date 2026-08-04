# 🍽️ Cravyo - Reel-Based Food Discovery Platform

Cravyo is a full-stack food discovery platform inspired by Instagram Reels, designed to help users discover restaurants and dishes through engaging short-form videos. It enables customers to browse food reels, interact with content, and discover new restaurants, while allowing food partners to showcase their dishes by uploading short-form video content.

The project follows a hybrid database architecture where **MySQL** is used for structured authentication data and **MongoDB** is used for highly scalable social media content such as reels, likes, comments, and saved reels. This architecture combines the strengths of relational and NoSQL databases to build a scalable and production-ready application.

---

# 🚀 Features

## 👤 Customer

- Register & Login
- Secure JWT Authentication
- Browse Food Reels
- Infinite Scroll Feed
- Like Food Reels
- Comment on Reels
- Save Favorite Reels
- Search Food & Restaurants
- Logout

---

## 🏪 Food Partner

- Register & Login
- Secure JWT Authentication
- Upload Food Reels
- Manage Restaurant Profile
- Add Food Items
- Logout

---# 🏗️ System Architecture

```text
                       Client Layer
┌──────────────────────────────────────────────────────────────┐
│                     React.js Frontend                        │
│  Login • Feed • Search • Upload • Likes • Comments • Saves  │
└──────────────────────────────────────────────────────────────┘
                           │
                    HTTPS / REST APIs
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   Express.js Backend API                     │
│                                                              │
│  Routes → Middleware → Controllers → Services → Models       │
└──────────────────────────────────────────────────────────────┘
                           │
      ┌────────────────────┼─────────────────────┐
      │                    │                     │
      ▼                    ▼                     ▼
┌─────────────-─┐   ┌────────────────┐   ┌─────────────────┐
│Authentication │   │ Business Logic │   │External Services│
│               │   │                │   │                 │
│ JWT           │   │ Food Reels     │   │ ImageKit CDN    │
│ Cookies       │   │ Likes          │   │ Elasticsearch   │
│ bcrypt        │   │ Comments       │   │ Redis Cache     │
│               │   │ Saved Reels    │   │                 │
└──────┬────────┘   └────────┬───────┘   └────────┬────────┘
       │                     │                    │
       ▼                     ▼                    ▼
┌──────────────┐     ┌────────────────────────────────────────┐
│    MySQL     │     │               MongoDB                  │
│              │     │                                        │
│ Customers    │     │ Food Reels                             │
│ FoodPartners │     │ Likes                                  │
│              │     │ Comments                               │
└──────────────┘     │ Saved Reels                            │
                     └────────────────────────────────────────┘
```
---

# 💻 Tech Stack

## Frontend

- React.js
- React Router DOM
- Axios
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

Used for document-based social media data.

- Food Reels
- Likes
- Comments
- Saved Reels

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
│   ├── foodPartner.controller.js
│
├── models
│   ├── customer.model.js
│   ├── foodPartner.model.js
│   ├── food.model.js
│   ├── likes.model.js
│   ├── comments.model.js
│   └── save.model.js
│
├── routes
│   ├── auth.routes.js
│   ├── food.routes.js
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
Store JWT in HTTP Only Cookie
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
Upload Reel
      │
      ▼
Multer
      │
      ▼
ImageKit Upload
      │
      ▼
Receive CDN URL
      │
      ▼
Store Reel Metadata in MongoDB
      │
      ▼
Food Reel Published
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
Store Saved Reel in MongoDB
      │
      ▼
Available in Saved Collection
```

---

# 🔍 Search Flow

```
Customer
      │
      ▼
Search Food / Restaurant
      │
      ▼
Elasticsearch
      │
      ▼
Matching Food Reels
```

---

# 📡 REST APIs

## Customer Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register Customer |
| POST | `/api/auth/login` | Login Customer |
| POST | `/api/auth/logout` | Logout Customer |
| GET | `/api/auth/me` | Get Current Customer |

---

## Food Partner Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/partner/register` | Register Food Partner |
| POST | `/api/partner/login` | Login Food Partner |
| POST | `/api/partner/logout` | Logout Food Partner |
| GET | `/api/partner/me` | Get Current Food Partner |

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

# ⚙️ Environment Variables

Use `backend/.env.example` and `frontend/.env.example` as configuration
templates. MongoDB authentication is the default. For the optional hybrid
MySQL authentication store, set `AUTH_DATABASE=mysql`, configure `MYSQL_*`,
then run these commands from `backend`:

```bash
npm run db:migrate:mysql
npm run db:migrate:accounts
```

The first command creates the SQL schema. The second copies existing customer
and merchant credentials into MySQL while preserving MongoDB records used by
products, carts, orders, likes, saves, and comments. Back up both databases
before migrating production data.

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
git clone https://github.com/Manasvi-Tyagi/cravyo.git
```

Navigate to the project

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

- Shopping Cart System
- Food Ordering & Checkout
- Order Tracking
- Payment Gateway Integration (Stripe/Razorpay)
- AI-powered Automatic Food Tagging
- Personalized Food Recommendations
- Restaurant Analytics Dashboard
- Real-time Notifications
- Ratings & Reviews
- Follow Restaurants
- User Profiles
- Restaurant Verification
- Trending & Recommended Reels
- Admin Dashboard
- Multi-language Support
- Dark Mode

---

# 👨‍💻 Author

**Manasvi Tyagi**

**Cravyo – Reel-Based Food Discovery Platform**

Built using **React.js, Node.js, Express.js, MySQL, MongoDB, Redis, Elasticsearch, ImageKit, JWT Authentication, and REST APIs.**
