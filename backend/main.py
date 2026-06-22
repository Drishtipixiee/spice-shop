"""
Spice Shop API – FastAPI application entry point.
"""

import os

from dotenv import load_dotenv

# Load .env before anything else
load_dotenv()

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    SLOWAPI_AVAILABLE = True
except ImportError:
    SLOWAPI_AVAILABLE = False

from database import Base, engine
from routers import admin, cart, categories, orders, payments, pincode, products
try:
    from routers.pincode import limiter
except Exception:
    limiter = None
from seed import run_seed
from models import Category  # noqa: F401 – ensure models are registered


# ─────────────────────────── Lifespan ───────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and seed data if DB is empty."""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Seed if the DB is empty (no categories means fresh DB)
    from database import SessionLocal

    db = SessionLocal()
    try:
        category_count = db.query(Category).count()
        if category_count == 0:
            run_seed()
    finally:
        db.close()

    yield  # Application runs here

    # Shutdown logic (if needed) goes here


# ─────────────────────────── App ───────────────────────────

app = FastAPI(
    title="Spice Shop API",
    description="Backend API for the Indian Spices & Dairy e-commerce website. "
    "Browse products, manage orders, and integrate with WhatsApp and Razorpay.",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiter (optional)
if SLOWAPI_AVAILABLE and limiter:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─────────────────────────── CORS ───────────────────────────

ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
origins = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",") if origin.strip()]
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────── Routers ───────────────────────────

app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(pincode.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(admin.router)


# ─────────────────────────── Health Check ───────────────────────────


@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Spice Shop API",
        "version": "1.0.0",
    }
