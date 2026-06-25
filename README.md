# 🌶️ Pure Spice & Dairy — Indian E-Commerce Store

A complete, production-ready full-stack e-commerce website for an Indian spices and dairy business. 

This repository has a dual-architecture setup (Python FastAPI backend for traditional deployment, and Node.js serverless functions for zero-config Vercel deployment) serving a lightweight Vanilla JS storefront and admin panel. It supports live product lookup, shopping cart, custom WhatsApp order dispatch, and Razorpay online payments.

---

## 🖥️ Architecture & Tech Stack

### Frontend
- **Vanilla HTML5, CSS3, & JavaScript** (located inside the [frontend/](file:///c:/Users/pande/New%20folder/spice-shop/frontend) directory). No React, Next.js, or Tailwind compiler overhead.
- Includes a Customer Storefront ([index.html](file:///c:/Users/pande/New%20folder/spice-shop/frontend/index.html)), a Commercial Landing Catalog ([shop.html](file:///c:/Users/pande/New%20folder/spice-shop/frontend/shop.html)), and an Admin Portal ([admin/index.html](file:///c:/Users/pande/New%20folder/spice-shop/frontend/admin/index.html)).

### Database
- **Supabase PostgreSQL** — Live database server storing products, categories, and customer orders.

### Backend (Dual Options)
1. **Serverless Mode (Active Live Vercel Architecture)**:
   - Written in Node.js / JavaScript (located in the root [/api](file:///c:/Users/pande/New%20folder/spice-shop/api) directory).
   - Automatically mapped by Vercel to zero-config serverless api endpoints.
2. **Traditional API Mode**:
   - Python FastAPI server (located in the [backend/](file:///c:/Users/pande/New%20folder/spice-shop/backend) directory).
   - Backed by SQLAlchemy. Used for running locally with Docker or deploying to services like Railway.

---

## 🚀 Running Locally

### Option 1: Live Serverless Local Emulation (Recommended)
You can run the entire e-commerce app (both the Vanilla frontend and JavaScript api functions) using the custom Node development server:

1. **Install dependencies** in the root directory:
   ```bash
   npm install
   ```
2. **Setup Environment**: Ensure you have a `.env` file in the root directory with your Supabase credentials:
   ```env
   DATABASE_URL=postgresql://postgres:...
   ADMIN_EMAIL=admin@spiceshop.in
   ADMIN_PASSWORD=Admin@1234
   JWT_SECRET=supersecretjwtkey
   WHATSAPP_NUMBER=919892360874
   ```
3. **Start the server**:
   ```bash
   node server.js
   ```
4. Visit the site at [http://localhost:3000](http://localhost:3000)

### Option 2: Python FastAPI Backend + Local Dev Server
If you prefer running the Python backend:
1. Start the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
2. Start the frontend:
   ```bash
   cd frontend
   node server.js
   ```

---

## 📦 Live Deployments on Vercel
This repository is pre-configured for Vercel deployment using **Vite**:
- **Live Demo Link:** [https://spice-shop-beta.vercel.app](https://spice-shop-beta.vercel.app) (or your Vercel project domain)
- Vercel executes the root build command: `npm run build` which uses Vite to bundle the static files from `frontend/` to `dist/`.
- Vercel deploys the contents of `dist/` as the static website root.
- Vercel deploys the JavaScript files in the root `api/` directory as live serverless functions.
- Local configuration is handled securely via Vercel Environment Variables.

---

## 🛒 Features
- **Responsive Storefront & Commercial Catalog**: Fast, mobile-responsive pages.
- **WhatsApp Order Integration**: Dispatches dynamic, pre-filled WhatsApp messages with order summaries directly to the owner's phone.
- **Razorpay Checkout**: Online payment gateway integration, secure server-side order generation (`/api/create-order`), and payment verification.
- **Pincode Delivery Check**: Custom checks for delivery service availability.
- **Interactive Chatbot**: Built-in storefront chatbot widget with database product keyword search.
- **Admin Dashboard**: Live portal (`/admin`) for editing products, categories, stock, and managing orders.

---

## 🔐 Credentials (Default Local / DB)
- **Admin Panel**: `/admin/login` (or `/admin`)
- **Login Email**: `admin@spiceshop.in`
- **Password**: `Admin@1234`
