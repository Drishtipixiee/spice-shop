"""
Payments router – Razorpay integration (create order + verify signature).
Falls back to mock data when ENABLE_RAZORPAY is false.
"""

import hashlib
import hmac
import os

import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Order

router = APIRouter(prefix="/payments", tags=["Payments"])

ENABLE_RAZORPAY = os.getenv("ENABLE_RAZORPAY", "false").lower() == "true"
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")


# ─────────────────────────── Pydantic Schemas ───────────────────────────


class CreateRazorpayOrderRequest(BaseModel):
    order_id: int


class CreateRazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    razorpay_key_id: str
    amount: int  # in paise
    currency: str
    order_id: int
    message: str


class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    verified: bool
    order_id: int
    status: str
    message: str


# ─────────────────────────── Endpoints ───────────────────────────


@router.post("/create-razorpay-order", response_model=CreateRazorpayOrderResponse)
def create_razorpay_order(
    body: CreateRazorpayOrderRequest,
    db: Session = Depends(get_db),
):
    """
    Create a Razorpay order for the given shop order.
    If ENABLE_RAZORPAY is false, returns mock data.
    """
    order = db.query(Order).filter(Order.id == body.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_method != "razorpay":
        raise HTTPException(
            status_code=400,
            detail="This order is not configured for Razorpay payment",
        )

    amount_paise = int(order.total * 100)

    if not ENABLE_RAZORPAY:
        # Return mock data for development
        mock_rp_order_id = f"order_mock_{order.id}"
        order.razorpay_order_id = mock_rp_order_id
        db.commit()

        return CreateRazorpayOrderResponse(
            razorpay_order_id=mock_rp_order_id,
            razorpay_key_id="rzp_test_mock_key",
            amount=amount_paise,
            currency="INR",
            order_id=order.id,
            message="Razorpay is disabled. This is mock data for development.",
        )

    # Real Razorpay API call
    try:
        response = requests.post(
            "https://api.razorpay.com/v1/orders",
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json={
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"order_{order.id}",
                "notes": {
                    "shop_order_id": str(order.id),
                    "customer_name": order.customer_name,
                },
            },
            timeout=30,
        )
        response.raise_for_status()
        rp_data = response.json()
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to create Razorpay order: {str(exc)}",
        )

    rp_order_id = rp_data["id"]
    order.razorpay_order_id = rp_order_id
    db.commit()

    return CreateRazorpayOrderResponse(
        razorpay_order_id=rp_order_id,
        razorpay_key_id=RAZORPAY_KEY_ID,
        amount=amount_paise,
        currency="INR",
        order_id=order.id,
        message="Razorpay order created successfully",
    )


@router.post("/verify", response_model=VerifyPaymentResponse)
def verify_payment(
    body: VerifyPaymentRequest,
    db: Session = Depends(get_db),
):
    """
    Verify a Razorpay payment signature using HMAC-SHA256.
    Updates order status to 'confirmed' on success.
    """
    order = (
        db.query(Order)
        .filter(Order.razorpay_order_id == body.razorpay_order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=404,
            detail="No order found for this Razorpay order ID",
        )

    if not ENABLE_RAZORPAY:
        # In mock mode, accept any signature
        order.status = "confirmed"
        order.razorpay_payment_id = body.razorpay_payment_id
        db.commit()

        return VerifyPaymentResponse(
            verified=True,
            order_id=order.id,
            status="confirmed",
            message="Payment verified (mock mode). Order confirmed.",
        )

    # Verify HMAC-SHA256 signature
    payload = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, body.razorpay_signature):
        raise HTTPException(
            status_code=400,
            detail="Payment verification failed. Invalid signature.",
        )

    # Update order
    order.status = "confirmed"
    order.razorpay_payment_id = body.razorpay_payment_id
    db.commit()

    return VerifyPaymentResponse(
        verified=True,
        order_id=order.id,
        status="confirmed",
        message="Payment verified successfully. Order confirmed.",
    )
