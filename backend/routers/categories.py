"""
Categories router – public endpoint for listing categories.
"""

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Category, Product

router = APIRouter(prefix="/categories", tags=["Categories"])


# ─────────────────────────── Pydantic Schemas ───────────────────────────


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    image_url: Optional[str] = None
    description: Optional[str] = None
    product_count: int

    class Config:
        from_attributes = True


# ─────────────────────────── Endpoints ───────────────────────────


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    """List all categories with product count."""
    categories = db.query(Category).all()
    result = []
    for cat in categories:
        product_count = (
            db.query(Product)
            .filter(
                Product.category_id == cat.id,
                Product.is_active == True,  # noqa: E712
            )
            .count()
        )
        result.append(
            CategoryOut(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                image_url=cat.image_url,
                description=cat.description,
                product_count=product_count,
            )
        )
    return result
