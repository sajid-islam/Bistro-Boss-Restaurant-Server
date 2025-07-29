# 🍽️ Bistro Boss Restaurant - Backend

This is the backend server for the **Bistro Boss Restaurant** web application. It is built using **Node.js**, **Express.js**, and **MongoDB**, and supports features like user authentication, menu management, cart system, and payment handling using Stripe.

---

## 🌐 Live Links

-   ✅ Client Site: [bistro-boss-three.vercel.app](https://bistro-boss-three.vercel.app)
-   🔗 Client Repo: [Frontend GitHub](https://github.com/sajid-islam/Bistro-Boss-Restaurant)
-   🔗 Server Repo: [Backend GitHub](https://github.com/sajid-islam/Bistro-Boss-Restaurant-Server)

---

## 🧰 Technologies Used

-   **Node.js**
-   **Express.js**
-   **MongoDB Atlas**
-   **JWT (JSON Web Token)**
-   **Stripe (Payment)**
-   **Vercel** (for deployment)
-   **dotenv** for environment variables

---

## 📁 Features

-   🔐 JWT Authentication with cookies
-   👤 User role (admin/user) check
-   🍔 Menu data fetch and update
-   🛒 Cart management (add/delete)
-   💳 Stripe payment integration
-   📦 Store order details and clear cart after payment

---

## 🔑 Environment Variables

Create a `.env` file and add:

```env
PORT=3000
DB_USER=your_mongodb_user
DB_PASS=your_mongodb_password
ACCESS_TOKEN_SECRET=your_jwt_secret
PAYMENT_SECRET_KEY=your_stripe_secret_key

```
