# 🌶️ Pure Spice & Dairy — Indian E-Commerce Store

A complete, production-ready e-commerce website for an Indian spices and dairy business. Built with **Next.js 14** and **FastAPI**, it supports **WhatsApp ordering** (zero setup) and optional **Razorpay payments**. Ships with a full admin panel, product catalog with variants, pincode-based delivery validation, and mobile-responsive UI — all backed by zero-config SQLite.

---

## 🖥️ Tech Stack

| Layer | Technology |
|------------|----------------------------------------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python 3.11) + SQLAlchemy |
| Database | SQLite (zero configuration) |
| Payments | WhatsApp (primary) + Razorpay (optional) |
| Auth | JWT + bcrypt |
| Deployment | Docker / Railway (backend) / Vercel (frontend) |

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up
```

That's it! Visit [http://localhost:3000](http://localhost:3000)

The backend API will be available at [http://localhost:8000](http://localhost:8000) and API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

### Option 2: Manual Start (Single Command)

**Prerequisites:** Python 3.11+, Node.js 18+, npm

```bash
chmod +x start.sh
./start.sh
```

This starts both services and seeds the database automatically.

### Option 3: Start Services Separately

**Backend:**

```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Admin Panel

| Field | Value |
|----------|-------------------------------|
| URL | http://localhost:3000/admin/login |
| Email | admin@spiceshop.in |
| Password | Admin@1234 |

### Admin Features

- **Dashboard** — Sales overview with order counts, revenue summary, and recent activity
- **Product Management** — Add, edit, and delete products with images, variants, and categories
- **Order Management** — View all orders, update order status (Pending → Confirmed → Shipped → Delivered)

---

## 🛒 Features

- **Product Catalog** — Browse products organized by categories: Spices, Dairy, and Combo Packs
- **Product Variants** — Multiple sizes and weights per product (e.g., 100g, 250g, 500g, 1kg)
- **WhatsApp Ordering** — Primary order flow via WhatsApp with zero setup required
- **Razorpay Payments** — Optional online payment integration (enable when ready)
- **Pincode Validation** — Delivery availability check for Mumbai area pin codes
- **Mobile-Responsive Design** — Fully responsive UI that works on all screen sizes
- **Admin Panel** — Complete back-office for managing products, orders, and viewing analytics
- **FSSAI Compliance** — Placeholder for FSSAI license number display in footer
- **Search & Filter** — Find products by name, category, or price range
- **Cart Management** — Add to cart, update quantities, remove items
- **Order Tracking** — Customers can track order status updates

---

## ⚙️ What to Change for Your Business

### Essential (Update Environment Variables)

| Setting | File | Description |
|----------------------|-------------------------------|-------------|
| `WHATSAPP_NUMBER` | `backend/.env` & `frontend/.env.local` | Your WhatsApp number with country code (e.g., `919876543210`) |
| `ADMIN_PASSWORD` | `backend/.env` | Change the default admin password |
| `JWT_SECRET` | `backend/.env` | Change to a random secure string (use `openssl rand -hex 32`) |
| `ADMIN_EMAIL` | `backend/.env` | Your admin login email |

### Recommended

- Update the FSSAI license number in `frontend/src/components/Footer.tsx`
- Replace product images in `frontend/public/images/` with your own product photos
- Add your business name, logo, and contact details throughout the frontend
- Update the `seed.py` file with your actual product catalog
- Add more pin codes for your delivery area in the backend delivery validation

### Optional — Enable Razorpay Payments

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Get your **Key ID** and **Key Secret** from Dashboard → Settings → API Keys
3. Update both environment files:

   **backend/.env:**
   ```env
   ENABLE_RAZORPAY=true
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_key_secret_here
   ```

   **frontend/.env.local:**
   ```env
   NEXT_PUBLIC_ENABLE_RAZORPAY=true
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   ```

4. Restart the app — customers will now see both WhatsApp and Razorpay payment options

---

## 🚀 Deploy to Production

### Deploy Backend to Railway.app (Free Tier Available)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select the `backend` directory — Railway auto-detects Python
4. Add environment variables from `backend/.env`:
   - `DATABASE_URL` = `sqlite:///./data/shop.db`
   - `ADMIN_EMAIL` = your admin email
   - `ADMIN_PASSWORD` = your secure password
   - `JWT_SECRET` = your secure random string
   - `ALLOWED_ORIGIN` = your Vercel frontend URL
   - `WHATSAPP_NUMBER` = your WhatsApp number
   - `ENABLE_RAZORPAY` = `true` or `false`
   - `RAZORPAY_KEY_ID` = your key (if enabled)
   - `RAZORPAY_KEY_SECRET` = your secret (if enabled)
5. Your API will be live at `https://your-app.railway.app`

### Deploy Frontend to Vercel (Free Tier Available)

1. Go to [vercel.com](https://vercel.com) → **Import Git Repository**
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL (e.g., `https://your-app.railway.app`)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = your WhatsApp number
   - `NEXT_PUBLIC_ENABLE_RAZORPAY` = `true` or `false`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` = your key (if enabled)
4. Deploy! Your store will be live at `https://your-store.vercel.app`

---

## 📁 Project Structure

```
spice-shop/
├── docker-compose.yml          # Docker orchestration for both services
├── start.sh                    # One-command local startup script
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
│
├── backend/                    # FastAPI Backend (Port 8000)
│   ├── Dockerfile              # Backend container configuration
│   ├── requirements.txt        # Python dependencies
│   ├── main.py                 # FastAPI app entry point & route registration
│   ├── seed.py                 # Database seeder with sample products
│   ├── database.py             # SQLAlchemy engine & session configuration
│   ├── models.py               # SQLAlchemy ORM models (Product, Order, User, etc.)
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── auth.py                 # JWT authentication & password hashing utilities
│   ├── .env                    # Backend environment variables
│   ├── data/                   # SQLite database storage
│   │   ├── .gitkeep            # Ensures directory is tracked by git
│   │   └── shop.db             # SQLite database (auto-created)
│   └── routers/                # API route modules
│       ├── products.py         # Product CRUD endpoints
│       ├── orders.py           # Order management endpoints
│       ├── admin.py            # Admin authentication & dashboard endpoints
│       └── payments.py         # Razorpay payment integration endpoints
│
└── frontend/                   # Next.js 14 Frontend (Port 3000)
    ├── Dockerfile              # Frontend container configuration
    ├── package.json            # Node.js dependencies & scripts
    ├── next.config.js          # Next.js configuration
    ├── tailwind.config.ts      # Tailwind CSS configuration
    ├── tsconfig.json           # TypeScript configuration
    ├── postcss.config.js       # PostCSS configuration
    ├── .env.local              # Frontend environment variables
    ├── public/                 # Static assets
    │   └── images/             # Product and brand images
    └── src/
        ├── app/                # Next.js App Router pages
        │   ├── layout.tsx      # Root layout with providers
        │   ├── page.tsx        # Homepage with hero & featured products
        │   ├── products/       # Product listing & detail pages
        │   ├── cart/           # Shopping cart page
        │   ├── checkout/       # Checkout flow
        │   └── admin/          # Admin panel pages
        │       ├── login/      # Admin login page
        │       ├── dashboard/  # Admin dashboard
        │       ├── products/   # Product management (CRUD)
        │       └── orders/     # Order management
        ├── components/         # Reusable React components
        │   ├── Navbar.tsx      # Navigation bar with cart icon
        │   ├── Footer.tsx      # Footer with FSSAI info
        │   ├── ProductCard.tsx # Product card component
        │   ├── CartDrawer.tsx  # Slide-out cart drawer
        │   └── WhatsAppButton.tsx # Floating WhatsApp button
        ├── lib/                # Utility functions & API client
        │   ├── api.ts          # Axios API client configuration
        │   └── utils.ts        # Helper functions
        └── context/            # React context providers
            ├── CartContext.tsx  # Shopping cart state management
            └── AuthContext.tsx  # Admin authentication state
```

---

## 🔒 Security

- **JWT Authentication** — Secure token-based authentication for the admin panel with expiry
- **bcrypt Password Hashing** — Industry-standard password hashing with salt rounds
- **Rate Limiting** — Protection against brute-force attacks on login and sensitive endpoints
- **CORS Protection** — Strict cross-origin resource sharing, only allowed origins can access the API
- **Parameterized Queries** — SQLAlchemy ORM prevents SQL injection attacks
- **Server-side Validation** — All inputs are validated using Pydantic schemas on the backend
- **HTTP-only Cookies** — JWT tokens stored securely (not accessible via JavaScript)
- **Environment Variables** — Sensitive configuration kept out of source code

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 or 8000 in use | Kill the process using the port: `lsof -ti:3000 \| xargs kill` |
| Database errors | Delete `backend/data/shop.db` and re-run `python seed.py` |
| npm install fails | Delete `node_modules` and `package-lock.json`, then run `npm install` |
| Docker build fails | Run `docker-compose build --no-cache` for a clean rebuild |
| CORS errors in browser | Ensure `ALLOWED_ORIGIN` in backend matches your frontend URL |
| WhatsApp not opening | Verify `WHATSAPP_NUMBER` includes country code (e.g., `919876543210`) |

---

## 📄 License

MIT License — feel free to use this for your own spice and dairy business!
