# Focus Foundry - Backend Architecture Guide

This document outlines the structure, responsibilities, and API design for the Focus Foundry backend. The goal is to migrate the current static JSON-based data (`products.json`) into a robust, scalable Node.js/Express environment.

## 1. Project Structure
A clean separation of concerns is recommended. Below is the proposed folder structure for the `backend/` directory:

```text
backend/
├── config/             # Database connection, environment variables
├── controllers/        # Request handling logic
├── middleware/         # Auth, validation, error handling
├── models/             # Database schemas (Mongoose/Sequelize)
├── routes/             # API route definitions
├── utils/              # Helper functions (JWT, Cloudinary)
├── .env                # Secrets (DB_URI, JWT_SECRET, etc.)
└── server.js           # Entry point
```

---

## 2. Tech Stack Recommendations
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose) — ideal for flexible product attributes.
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` for password hashing.
- **Image Storage:** Cloudinary (already used in your product URLs).

---

## 3. Core Responsibilities of the Backend
1.  **Product Management:** Serve products dynamically, filter by category (Eyeglasses, Sunglasses, Best Sellers), and manage inventory.
2.  **User Authentication:** Handle Sign Up, Sign In, and session persistence.
3.  **Cart & Orders:** Persist user carts across devices and process checkout.
4.  **Security:** Protect user data and ensure only authenticated users can access checkout or profile routes.

---

## 4. API Routes Design

### **Authentication Routes** (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/register` | Create a new user account. |
| POST | `/login` | Authenticate user and return a JWT. |
| GET | `/me` | Get current user's profile (Protected). |

### **Product Routes** (`/api/products`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Fetch all products. |
| GET | `/:id` | Fetch details of a single product. |
| GET | `/category/:slug` | Filter products (e.g., `eyeglasses`, `sunglasses`). |
| POST | `/` | (Admin Only) Add a new product. |

### **Cart & Order Routes** (`/api/orders`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/cart` | Fetch user's saved cart items. |
| POST | `/cart` | Add/Update items in the cart. |
| POST | `/checkout` | Create an order and clear the cart. |
| GET | `/my-orders` | Fetch order history for the logged-in user. |

---

## 5. Data Models

### **User Model**
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `isAdmin`: Boolean (Default: false)

### **Product Model**
- `name`: String
- `description`: String
- `price`: Number
- `category`: String (Enum: ['New Arrivals', 'Best Seller', 'Eyeglass', 'Sunglass'])
- `image`: String (URL)
- `stock`: Number

---

## 6. Frontend Integration Steps
1.  **Replace Local Data:** In `src/pages/Home.jsx`, `Eyeglasses.jsx`, and `Sunglasses.jsx`, replace the import of `products.json` with a `useEffect` hook that fetches from `http://localhost:5000/api/products`.
2.  **State Management:** Use `Context API` or `Redux` to store the User Auth token and the Cart count globally.
3.  **Axios Instance:** Create an Axios instance with `baseURL` and interceptors to automatically attach the JWT token to headers for protected routes.
4.  **Protected Routes:** Wrap the `/cart` and `/checkout` routes in a component that checks if a user is logged in, redirecting to `/signin` if not.

---

## 7. Security Best Practices
- **Password Hashing:** Always use `bcryptjs` with a salt round of 10+ before saving passwords.
- **JWT Security:** Store tokens in `HttpOnly` cookies on the frontend to prevent XSS attacks, or use `Authorization: Bearer` headers with short expiration times.
- **Input Validation:** Use `express-validator` or `Joi` to sanitize and validate all incoming request bodies (especially for Sign Up and Checkout).
- **CORS Configuration:** Limit cross-origin requests to your frontend domain only.
- **Rate Limiting:** Use `express-rate-limit` to prevent brute-force attacks on login routes.
- **Environment Variables:** Never hardcode secrets. Use a `.env` file for:
    - `PORT=5000`
    - `MONGO_URI=your_mongodb_connection_string`
    - `JWT_SECRET=your_super_secret_key`
    - `CLOUDINARY_URL=your_cloudinary_config`

---

## 8. Detailed Implementation Steps

### Phase 1: Server Setup
1. Initialize: `npm init -y`
2. Install: `npm i express mongoose dotenv cors jsonwebtoken bcryptjs helmet morgan`
3. Create `server.js` and connect to MongoDB using `mongoose.connect()`.

### Phase 2: Product Migration
1. Define the `Product` schema in `models/Product.js`.
2. Create a script to read `src/data/products.json` and `insertMany()` into your database.
3. Create the `GET /api/products` route to replace the local import.

### Phase 3: Auth System
1. Create `User` model with encrypted password field.
2. Implement `POST /register` and `POST /login` in `controllers/authController.js`.
3. Create `middleware/auth.js` to verify JWT and attach `req.user`.

### Phase 4: Cart Persistence
1. Update the `Cart.jsx` frontend to send requests to `POST /api/orders/cart`.
2. Create a `Cart` model that links `userId` to an array of `productId`s and quantities.

### Phase 5: Deployment
1. Frontend: Deploy on Vercel or Netlify.
2. Backend: Deploy on Render, Railway, or Heroku.
3. Database: MongoDB Atlas (Free Tier).