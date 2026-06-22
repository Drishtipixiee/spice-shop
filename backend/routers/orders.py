"""
Orders router – create orders and retrieve order details.
"""

import os
import re
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Order, OrderItem, PincodeZone, ProductVariant

router = APIRouter(prefix="/orders", tags=["Orders"])

WHATSAPP_NUMBER = os.getenv("WHATSAPP_NUMBER", "919999999999")
PHONE_REGEX = re.compile(r"^[6-9]\d{9}$")


# ─────────────────────────── Pydantic Schemas ───────────────────────────


class OrderItemIn(BaseModel):
    variant_id: int
    quantity: int


class OrderCreateRequest(BaseModel):
    customer_name: str
    customer_phone: str
    address: str
    pincode: str
    items: list[OrderItemIn]
    payment_method: str  # 'whatsapp' or 'razorpay'


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


class OrderCreateResponse(BaseModel):
    order_id: int
    whatsapp_url: str | None = None
    total: float
    status: str


# ─────────────────────────── Helper ───────────────────────────


def _build_whatsapp_message(order: Order) -> str:
    """Build the WhatsApp order message."""
    item_lines = ""
    for item in order.items:
        line_total = round(item.unit_price * item.quantity, 2)
        item_lines += f"• {item.product_name} {item.variant_label} × {item.quantity} = ₹{line_total}\n"

    message = (
        f"Hello! I'd like to place an order 🛒\n\n"
        f"*Order Summary:*\n"
        f"{item_lines}\n"
        f"*Subtotal:* ₹{order.subtotal}\n"
        f"*Delivery:* ₹{order.delivery_charge}\n"
        f"*Total:* ₹{order.total}\n\n"
        f"*Delivery Details:*\n"
        f"Name: {order.customer_name}\n"
        f"Phone: {order.customer_phone}\n"
        f"Address: {order.address}\n"
        f"Pincode: {order.pincode}\n\n"
        f"Please confirm my order. Thank you! 🙏"
    )
    return message


# ─────────────────────────── Endpoints ───────────────────────────


@router.post("/create", response_model=OrderCreateResponse)
def create_order(body: OrderCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new order.
    Validates phone, pincode, stock, calculates totals, and returns
    WhatsApp URL or order_id for Razorpay.
    """
    # --- Validate customer name ---
    if not body.customer_name or len(body.customer_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Customer name is required (minimum 2 characters)")

    # --- Validate phone ---
    phone = body.customer_phone.strip()
    if not PHONE_REGEX.match(phone):
        raise HTTPException(
            status_code=400,
            detail="Invalid phone number. Must be 10 digits starting with 6-9.",
        )

    # --- Validate address ---
    if not body.address or len(body.address.strip()) < 10:
        raise HTTPException(status_code=400, detail="Address is required (minimum 10 characters)")

    # --- Validate payment method ---
    if body.payment_method not in ("whatsapp", "razorpay"):
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method. Must be 'whatsapp' or 'razorpay'.",
        )

    # --- Validate pincode ---
    pincode = body.pincode.strip()
    zone = (
        db.query(PincodeZone)
        .filter(PincodeZone.pincode == pincode, PincodeZone.is_active == True)  # noqa: E712
        .first()
    )
    if not zone:
        raise HTTPException(
            status_code=400,
            detail=f"Pincode {pincode} is not serviceable.",
        )

    # --- Validate items ---
    if not body.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    order_items: list[OrderItem] = []
    subtotal = 0.0

    for item_in in body.items:
        variant = (
            db.query(ProductVariant)
            .filter(ProductVariant.id == item_in.variant_id)
            .first()
        )
        if not variant:
            raise HTTPException(
                status_code=400,
                detail=f"Variant ID {item_in.variant_id} not found",
            )
        if not variant.product.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"Product '{variant.product.name}' is not available",
            )
        if item_in.quantity < 1:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid quantity for {variant.product.name}",
            )
        if item_in.quantity > variant.stock_qty:
            raise HTTPException(
                status_code=400,
                detail=f"Only {variant.stock_qty} units available for "
                f"{variant.product.name} ({variant.weight_label})",
            )

        line_total = round(variant.price_inr * item_in.quantity, 2)
        subtotal += line_total

        order_items.append(
            OrderItem(
                variant_id=variant.id,
                product_name=variant.product.name,
                variant_label=variant.weight_label,
                quantity=item_in.quantity,
                unit_price=variant.price_inr,
            )
        )

    subtotal = round(subtotal, 2)
    delivery_charge = 0.0 if subtotal >= 499 else 40.0
    total = round(subtotal + delivery_charge, 2)

    # --- Create order ---
    order = Order(
        customer_name=body.customer_name.strip(),
        customer_phone=phone,
        address=body.address.strip(),
        pincode=pincode,
        zone_name=zone.zone_name,
        subtotal=subtotal,
        delivery_charge=delivery_charge,
        total=total,
        status="pending",
        payment_method=body.payment_method,
    )
    db.add(order)
    db.flush()

    # Assign order_id to items and add
    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    # Reduce stock
    for item_in in body.items:
        variant = (
            db.query(ProductVariant)
            .filter(ProductVariant.id == item_in.variant_id)
            .first()
        )
        if variant:
            variant.stock_qty -= item_in.quantity

    db.commit()
    db.refresh(order)

    # --- Build response ---
    whatsapp_url = None
    if body.payment_method == "whatsapp":
        message = _build_whatsapp_message(order)
        encoded_message = quote(message)
        whatsapp_url = f"https://wa.me/{WHATSAPP_NUMBER}?text={encoded_message}"

    return OrderCreateResponse(
        order_id=order.id,
        whatsapp_url=whatsapp_url,
        total=order.total,
        status=order.status,
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order with all items."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return OrderOut(
        id=order.id,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        address=order.address,
        pincode=order.pincode,
        zone_name=order.zone_name,
        subtotal=order.subtotal,
        delivery_charge=order.delivery_charge,
        total=order.total,
        status=order.status,
        payment_method=order.payment_method,
        razorpay_order_id=order.razorpay_order_id,
        razorpay_payment_id=order.razorpay_payment_id,
        created_at=order.created_at.isoformat(),
        items=[OrderItemOut.model_validate(item) for item in order.items],
    )
