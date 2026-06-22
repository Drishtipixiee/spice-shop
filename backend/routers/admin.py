"""
Admin router – authentication and admin CRUD operations.
All routes except /admin/login require JWT auth.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import AdminUser, Category, Order, OrderItem, Product, ProductVariant

router = APIRouter(prefix="/admin", tags=["Admin"])

# Security
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkey2025changeme")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()


# ─────────────────────────── Auth Dependency ───────────────────────────


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:
    """Dependency that extracts, verifies the JWT, and returns the admin user."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

    admin = db.query(AdminUser).filter(AdminUser.email == email).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user not found",
        )
    return admin


# ─────────────────────────── Pydantic Schemas ───────────────────────────


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    email: str


class TopProduct(BaseModel):
    name: str
    total_qty_sold: int


class StatsResponse(BaseModel):
    total_orders: int
    total_revenue: float
    pending_orders: int
    total_products: int
    top_products: list[TopProduct]


class OrderItemOut(BaseModel):
    id: int
    variant_id: int
    product_name: str
    variant_label: str
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    address: str
    pincode: str
    zone_name: str
    subtotal: float
    delivery_charge: float
    total: float
    status: str
    payment_method: str
    razorpay_order_id: str | None = None
    razorpay_payment_id: str | None = None
    created_at: str
    items: list[OrderItemOut] = []

    class Config:
        from_attributes = True


class UpdateOrderStatusRequest(BaseModel):
    status: str


class VariantIn(BaseModel):
    weight_label: str
    price_inr: float
    mrp_inr: float
    stock_qty: int = 100
    sku: str


class VariantOut(BaseModel):
    id: int
    weight_label: str
    price_inr: float
    mrp_inr: float
    stock_qty: int
    sku: str

    class Config:
        from_attributes = True


class ProductCreateRequest(BaseModel):
    name: str
    slug: str
    category_id: int
    description: str = ""
    image_url: str = ""
    is_featured: bool = False
    variants: list[VariantIn] = []


class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    variants: Optional[list[VariantIn]] = None


class CategoryBrief(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    is_featured: bool
    category: CategoryBrief
    variants: list[VariantOut] = []

    class Config:
        from_attributes = True


# ─────────────────────────── Endpoints ───────────────────────────


@router.post("/login", response_model=LoginResponse)
def admin_login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate admin and return JWT."""
    admin = db.query(AdminUser).filter(AdminUser.email == body.email).first()
    if not admin or not pwd_context.verify(body.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS)
    token = jwt.encode(
        {"sub": admin.email, "exp": expire},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        email=admin.email,
    )


@router.get("/stats", response_model=StatsResponse)
def get_stats(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Return dashboard stats: counts, revenue, top products."""
    total_orders = db.query(func.count(Order.id)).scalar() or 0

    total_revenue = db.query(func.sum(Order.total)).scalar() or 0.0

    pending_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status == "pending")
        .scalar()
        or 0
    )

    total_products = (
        db.query(func.count(Product.id))
        .filter(Product.is_active == True)  # noqa: E712
        .scalar()
        or 0
    )

    # Top products by quantity sold
    top_products_query = (
        db.query(
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("total_qty"),
        )
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    top_products = [
        TopProduct(name=row[0], total_qty_sold=int(row[1]))
        for row in top_products_query
    ]

    return StatsResponse(
        total_orders=total_orders,
        total_revenue=round(total_revenue, 2),
        pending_orders=pending_orders,
        total_products=total_products,
        top_products=top_products,
    )


@router.get("/orders", response_model=list[OrderOut])
def list_orders(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List orders with optional status filter, paginated."""
    query = db.query(Order)

    if status:
        valid_statuses = {"pending", "confirmed", "shipped", "delivered", "cancelled"}
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
            )
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    return [
        OrderOut(
            id=o.id,
            customer_name=o.customer_name,
            customer_phone=o.customer_phone,
            address=o.address,
            pincode=o.pincode,
            zone_name=o.zone_name,
            subtotal=o.subtotal,
            delivery_charge=o.delivery_charge,
            total=o.total,
            status=o.status,
            payment_method=o.payment_method,
            razorpay_order_id=o.razorpay_order_id,
            razorpay_payment_id=o.razorpay_payment_id,
            created_at=o.created_at.isoformat(),
            items=[OrderItemOut.model_validate(item) for item in o.items],
        )
        for o in orders
    ]


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    body: UpdateOrderStatusRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update an order's status."""
    valid_statuses = {"pending", "confirmed", "shipped", "delivered", "cancelled"}
    if body.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = body.status
    db.commit()
    db.refresh(order)

    return {
        "order_id": order.id,
        "status": order.status,
        "message": f"Order status updated to '{order.status}'",
    }


@router.get("/products", response_model=list[ProductOut])
def list_all_products(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Return all products (including inactive) with variants."""
    products = db.query(Product).order_by(Product.created_at.desc()).all()
    return products


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(
    body: ProductCreateRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new product with variants."""
    # Check category exists
    category = db.query(Category).filter(Category.id == body.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")

    # Check slug uniqueness
    existing = db.query(Product).filter(Product.slug == body.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Product slug '{body.slug}' already exists")

    # Check SKU uniqueness
    for v in body.variants:
        sku_exists = db.query(ProductVariant).filter(ProductVariant.sku == v.sku).first()
        if sku_exists:
            raise HTTPException(status_code=400, detail=f"SKU '{v.sku}' already exists")

    product = Product(
        name=body.name,
        slug=body.slug,
        category_id=body.category_id,
        description=body.description,
        image_url=body.image_url,
        is_featured=body.is_featured,
        is_active=True,
    )
    db.add(product)
    db.flush()

    for v in body.variants:
        variant = ProductVariant(
            product_id=product.id,
            weight_label=v.weight_label,
            price_inr=v.price_inr,
            mrp_inr=v.mrp_inr,
            stock_qty=v.stock_qty,
            sku=v.sku,
        )
        db.add(variant)

    db.commit()
    db.refresh(product)
    return product


@router.patch("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    body: ProductUpdateRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Partial update of product fields and/or variants."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update scalar fields
    if body.name is not None:
        product.name = body.name
    if body.slug is not None:
        existing = (
            db.query(Product)
            .filter(Product.slug == body.slug, Product.id != product_id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400, detail=f"Slug '{body.slug}' already in use"
            )
        product.slug = body.slug
    if body.category_id is not None:
        category = db.query(Category).filter(Category.id == body.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
        product.category_id = body.category_id
    if body.description is not None:
        product.description = body.description
    if body.image_url is not None:
        product.image_url = body.image_url
    if body.is_featured is not None:
        product.is_featured = body.is_featured
    if body.is_active is not None:
        product.is_active = body.is_active

    # Replace variants if provided
    if body.variants is not None:
        # Remove existing variants
        db.query(ProductVariant).filter(
            ProductVariant.product_id == product_id
        ).delete()
        db.flush()

        for v in body.variants:
            # Check SKU uniqueness (against other products' variants)
            sku_exists = (
                db.query(ProductVariant)
                .filter(
                    ProductVariant.sku == v.sku,
                    ProductVariant.product_id != product_id,
                )
                .first()
            )
            if sku_exists:
                raise HTTPException(
                    status_code=400, detail=f"SKU '{v.sku}' already in use"
                )

            variant = ProductVariant(
                product_id=product_id,
                weight_label=v.weight_label,
                price_inr=v.price_inr,
                mrp_inr=v.mrp_inr,
                stock_qty=v.stock_qty,
                sku=v.sku,
            )
            db.add(variant)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Soft delete – set is_active=False."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False
    db.commit()

    return {
        "product_id": product.id,
        "is_active": False,
        "message": f"Product '{product.name}' has been deactivated",
    }
