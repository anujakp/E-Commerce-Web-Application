# ShopSphere — E-Commerce Web Application

Full-stack MERN e-commerce project for the assignment.

## Features

### User
- Registration and login
- Product catalog
- Product sections for groceries, clothing, and electronics
- Product search and category filter
- Product details
- Add to cart
- Update/remove cart items
- Checkout
- Order creation
- Order history and order status tracking

### Admin
- Role-based admin access
- Add products
- Update products
- Delete products
- View all orders
- Update order status

### Technology
- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- REST API
- Responsive CSS

## Requirements

Install Node.js 18+ and MongoDB locally, or use MongoDB Atlas.

## Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Run:

```bash
npm run dev
```

## Frontend

Open another terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

If port 5173 is already in use, Vite will pick another port (for example 5175). In that case, the backend accepts localhost origins automatically, so login will still work without changing the API URL.

Run:

```bash
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5174
```

## API

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Products
- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products` — admin
- PUT `/api/products/:id` — admin
- DELETE `/api/products/:id` — admin

### Orders
- POST `/api/orders`
- GET `/api/orders/my`
- GET `/api/orders` — admin
- PATCH `/api/orders/:id/status` — admin

## Demo

1. Register a normal user.
2. Browse the preloaded grocery, clothing, and electronics products.
3. Add products to cart.
4. Open cart and change quantities.
5. Checkout with a demo payment method.
6. View order history.
7. For admin testing, change a registered user's role in MongoDB to `admin`.
8. Log in again and use the Admin panel to manage products and order status.

## Important

This project uses a demo checkout. It does not process real card payments. For a production store, integrate a payment gateway such as Razorpay or Stripe.
