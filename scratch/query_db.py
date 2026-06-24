import os
import sys

# Append the absolute path of the backend directory directly
sys.path.append(r"c:\Users\Admin\Downloads\files (1)\spice-shop\backend")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Product, ProductVariant, Category, Base

# Force local SQLite connection
DATABASE_URL = r"sqlite:///c:\Users\Admin\Downloads\files (1)\spice-shop\backend\data\shop.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def main():
    db = SessionLocal()
    try:
        print("Fetching products from local SQLite...")
        products = db.query(Product).all()
        for p in products:
            print(f"ID: {p.id} | Name: {p.name} | Image URL: {p.image_url}")
            for v in p.variants:
                print(f"  Variant SKU: {v.sku} | Weight: {v.weight_label} | Price: {v.price_inr} | MRP: {v.mrp_inr} | Stock: {v.stock_qty}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
