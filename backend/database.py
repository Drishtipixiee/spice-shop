"""
Database configuration and session management for the Spice Shop API.
Uses SQLAlchemy ORM with SQLite backend.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

# Automatically read from Supabase URL if provided, otherwise fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/shop.db")

# SQLAlchemy requires 'postgresql://' instead of 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure args based on the database type
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    
    # Ensure local directory exists for sqlite
    os.makedirs(os.path.dirname("./data/shop.db"), exist_ok=True)

try:
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"Error connecting to database: {e}")
    raise

Base = declarative_base()

def get_db():
    """FastAPI dependency that yields a DB session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
