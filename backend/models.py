"""
SQLAlchemy ORM models for the Spice Shop e-commerce application.
All prices are in INR (₹).
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    description = Column(String(500), nullable=True)

    # Relationships
    products = relationship("Product", back_populates="category", lazy="selectin")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    category = relationship("Category", back_populates="products", lazy="selectin")
    variants = relationship(
        "ProductVariant",
        back_populates="product",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    weight_label = Column(String(50), nullable=False)  # e.g. '100g', '500g', '1L'
    price_inr = Column(Float, nullable=False)
    mrp_inr = Column(Float, nullable=False)
    stock_qty = Column(Integer, default=100, nullable=False)
    sku = Column(String(50), unique=True, nullable=False, index=True)

    # Relationships
    product = relationship("Product", back_populates="variants", lazy="selectin")


class PincodeZone(Base):
    __tablename__ = "pincode_zones"

    id = Column(Integer, primary_key=True, index=True)
    pincode = Column(String(6), unique=True, nullable=False, index=True)
    zone_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(200), nullable=False)
    customer_phone = Column(String(15), nullable=False)
    address = Column(String(500), nullable=False)
    pincode = Column(String(6), nullable=False)
    zone_name = Column(String(100), nullable=False)
    subtotal = Column(Float, nullable=False)
    delivery_charge = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    payment_method = Column(String(20), nullable=False)  # 'whatsapp' or 'razorpay'
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    items = relationship(
        "OrderItem",
        back_populates="order",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    variant_label = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
