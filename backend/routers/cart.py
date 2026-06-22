"""
Cart router – validates cart items against current stock and prices.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import ProductVariant

router = APIRouter(prefix="/cart", tags=["Cart"])


# ─────────────────────────── Pydantic Schemas ───────────────────────────


class CartItemIn(BaseModel):
    variant_id: int
    quantity: int


class CartValidateRequest(BaseModel):
    items: list[CartItemIn]


class ValidatedCartItem(BaseModel):
    variant_id: int
    product_name: str
    variant_label: str
    quantity: int
    price_inr: float
    mrp_inr: float
    stock_qty: int
    sku: str
    line_total: float

    class Config:
        from_attributes = True


class CartValidateResponse(BaseModel):
    valid: bool
    items: list[ValidatedCartItem]
    subtotal: float
    errors: list[str]


# ─────────────────────────── Endpoints ───────────────────────────


@router.post("/validate", response_model=CartValidateResponse)
def validate_cart(body: CartValidateRequest, db: Session = Depends(get_db)):
    """
    Validate all cart items are in stock and return validated items
    with current prices.
    """
    if not body.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    validated_items: list[ValidatedCartItem] = []
    errors: list[str] = []
    subtotal = 0.0

    for item in body.items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()

        if not variant:
            errors.append(f"Variant ID {item.variant_id} not found")
            continue

        if not variant.product.is_active:
            errors.append(f"Product '{variant.product.name}' is no longer available")
            continue

        if item.quantity < 1:
            errors.append(f"Invalid quantity for {variant.product.name} ({variant.weight_label})")
            continue

        if item.quantity > variant.stock_qty:
            errors.append(
                f"Only {variant.stock_qty} units available for "
                f"{variant.product.name} ({variant.weight_label})"
            )
            continue

        line_total = round(variant.price_inr * item.quantity, 2)
        subtotal += line_total

        validated_items.append(
            ValidatedCartItem(
                variant_id=variant.id,
                product_name=variant.product.name,
                variant_label=variant.weight_label,
                quantity=item.quantity,
                price_inr=variant.price_inr,
                mrp_inr=variant.mrp_inr,
                stock_qty=variant.stock_qty,
                sku=variant.sku,
                line_total=line_total,
            )
        )

    return CartValidateResponse(
        valid=len(errors) == 0 and len(validated_items) > 0,
        items=validated_items,
        subtotal=round(subtotal, 2),
        errors=errors,
    )
