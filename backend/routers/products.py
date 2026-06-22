"""
Products router – public endpoints for browsing products.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Category, Product

router = APIRouter(prefix="/products", tags=["Products"])


# ─────────────────────────── Pydantic Schemas ───────────────────────────


class VariantOut(BaseModel):
    id: int
    weight_label: str
    price_inr: float
    mrp_inr: float
    stock_qty: int
    sku: str

    class Config:
        from_attributes = True


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


class ProductDetail(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    is_featured: bool
    created_at: str
    category: CategoryBrief
    variants: list[VariantOut] = []

    class Config:
        from_attributes = True


# ─────────────────────────── Endpoints ───────────────────────────


@router.get("", response_model=list[ProductOut])
def list_products(
    category_slug: Optional[str] = Query(None, description="Filter by category slug"),
    featured: Optional[bool] = Query(None, description="Filter featured products"),
    search: Optional[str] = Query(None, description="Search products by name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all active products with their variants. Supports filtering and search."""
    query = db.query(Product).filter(Product.is_active == True)  # noqa: E712

    if category_slug:
        category = db.query(Category).filter(Category.slug == category_slug).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        query = query.filter(Product.category_id == category.id)

    if featured is not None:
        query = query.filter(Product.is_featured == featured)

    if search:
        search_term = f"%{search}%"
        query = query.filter(Product.name.ilike(search_term))

    products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
    return products


@router.get("/{slug}", response_model=ProductDetail)
def get_product(slug: str, db: Session = Depends(get_db)):
    """Get a single product by slug with all variants and category info."""
    product = (
        db.query(Product)
        .filter(Product.slug == slug, Product.is_active == True)  # noqa: E712
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return ProductDetail(
        id=product.id,
        name=product.name,
        slug=product.slug,
        description=product.description,
        image_url=product.image_url,
        is_active=product.is_active,
        is_featured=product.is_featured,
        created_at=product.created_at.isoformat(),
        category=CategoryBrief.model_validate(product.category),
        variants=[VariantOut.model_validate(v) for v in product.variants],
    )
