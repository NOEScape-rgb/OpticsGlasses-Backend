# API Reference for Frontend

**Base URL:** `http://localhost:3000` (or your deployed URL)

**Response Format:**
All API responses follow a consistent JSON structure:
```json
{
  "isStatus": true,       // or false if error
  "msg": "Success message",
  "data": { ... }         // The requested object(s) or null
}
```

**Authentication:**
- Login returns a JWT in an `HttpOnly` cookie named `token`.
- You do not need to manually attach tokens to headers *if* the browser handles cookies (ensure `credentials: 'include'` in fetch/axios).
- **Public Routes:** Accessible by anyone.
- **Private Routes:** Require a valid session (cookie).

---

## 1. Authentication & Users (`/api/users`)

### Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users/signup` | Public | Register a new user. |
| **POST** | `/api/users/login` | Public | Login and set auth cookie. |
| **POST** | `/api/users/logout` | Private | Logout and clear cookie. |
| **GET** | `/api/users/me` | Private | Get current user's profile. |
| **POST** | `/api/users/forgot-password` | Public | Request password reset email. |
| **PATCH** | `/api/users/reset-password` | Public | Reset password using email token. |
| **PATCH** | `/api/users/change-password` | Private | Change password for logged-in user. |

### Data Objects

**User Object (`data`)**
```javascript
{
  "_id": "679...123",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "avatarUrl": "https://cloudinary...",
  "isAdmin": false,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA",
    // ...state, zip
  },
  "ordersCount": 0,
  "totalSpent": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Login/Signup Request Body**
```json
// Signup
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}

// Login
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

---

## 2. Products (`/api/products`)

### Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | Public | Get all products (supports filtering). |
| **GET** | `/api/products/:id` | Public | Get single product details. |

*(Admin routes: POST /, PATCH /:id, DELETE /:id)*

### Query Parameters (GET /)
- `?page=1&limit=10` (Pagination)
- `?category=Eyeglasses` (Filter)
- `?sort=price` (Sorting)
- `?search=rayban` (Search by name)

### Data Objects

**Product Object**
```javascript
{
  "_id": "679...456",
  "name": "Aviator Classic",
  "description": "Timeless design...",
  "price": 15000,
  "category": "Sunglasses", // Enum: Eyeglasses, Sunglasses, Computer Glasses, Accessories, Contact Lenses
  "images": [
    "https://cloudinary.com/img1.jpg",
    "https://cloudinary.com/img2.jpg"
  ],
  "stock": 50,
  "isOnSale": false,
  "discountPrice": 0,
  "brand": "Ray-Ban",
  "colors": ["Gold", "Black"],
  "materials": ["Metal"],
  "rating": 4.5,
  "reviewsCount": 10,
  "isFeatured": true
}
```

---

## 3. Orders (`/api/orders`)

### Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/orders` | Private | Create a new order (Checkout). |
| **GET** | `/api/orders/my-orders` | Private | Get logged-in user's order history. |
| **GET** | `/api/orders/:id` | Private | Get details of a specific order. |

### Data Objects

**Order Request Body (Checkout)**
```json
{
  "orderItems": [
    {
      "product": "PRODUCT_ID_HERE",
      "quantity": 2,
      "price": 15000,   // Included for snapshot
      "name": "Aviator",
      "image": "url..."
    }
  ],
  "shippingAddress": {
    "street": "...",
    "city": "...",
    "country": "..."
  },
  "paymentMethod": "Stripe", // or 'COD'
  "shippingPrice": 200,
  "total": 30200
}
```

**Order Object (Response)**
```javascript
{
  "_id": "679...789",
  "customer": { "_id": "...", "name": "..." }, // Populated
  "orderItems": [...],
  "status": "Pending",  // Processing, Shipped, Delivered, Cancelled
  "total": 30200,
  "paymentStatus": "Pending", // Paid, Failed
  "paymentMethod": "Stripe",
  "trackingNumber": "TRK123..."
}
```

---

## 4. Coupons (`/api/coupons`)

### Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/coupons/validate` | Public | Validate a coupon code during checkout. |

### Data Objects

**Validate Request**
```json
{
  "code": "WELCOME10",
  "orderAmount": 5000
}
```

**Coupon Object (Response)**
```javascript
{
  "code": "WELCOME10",
  "discountType": "percentage", // or 'fixed'
  "discountValue": 10
}
```

---

## 5. Reviews (`/api/reviews`)

### Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/reviews` | Private | Add a review for a product. |
| **GET** | `/api/reviews` | Public | Get reviews (usually filtered by ?product=ID). |

### Data Objects

**Review Request**
```json
{
  "product": "PRODUCT_ID",
  "rating": 5, // 1-5
  "comment": "Great glasses!"
}
```

---

## 6. Support Tickets (`/api/tickets`)

### Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/tickets` | Private | Create a support ticket. |
| **GET** | `/api/tickets` | Private | Get user's tickets. |
| **POST** | `/api/tickets/:id/message` | Private | Reply to a ticket. |

### Data Objects

**Ticket Object**
```javascript
{
  "subject": "Order Issue",
  "status": "Open", // In Progress, Resolved
  "priority": "Low",
  "messages": [
    { "sender": "customer", "message": "Help needed...", "timestamp": "..." }
  ]
}
```

---

## 7. Store Config (`/api/store`)

### Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/store/public` | Public | Get global settings (Shipping rates, SEO, Hero slides). |

### Data Objects

**Store Config Object**
```javascript
{
  "storeProfile": { "name": "OpticsGlasses", "email": "..." },
  "shipping": {
    "freeThreshold": 5000,
    "standardRate": 200
  },
  "cms": {
    "heroSlides": [ { "imgSrc": "...", "active": true } ]
  }
}
```

---

## 8. File Uploads (`/api/upload`)

### Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/upload` | Private | Upload single image (form-data: 'image'). Returns URL. |
| **POST** | `/api/upload/multiple` | Private | Upload multiple (form-data: 'images'). |
