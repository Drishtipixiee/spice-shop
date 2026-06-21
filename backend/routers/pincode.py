"""
Pincode router – validates delivery pincode against serviceable zones.
Rate limited to 20 requests/minute per IP using slowapi.
"""

import re

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from database import get_db
from models import PincodeZone

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(tags=["Pincode"])


# ─────────────────────────── Pydantic Schemas ───────────────────────────


class PincodeRequest(BaseModel):
    pincode: str


class PincodeResponse(BaseModel):
    deliverable: bool
    zone: str
    message: str
    delivery_charge: int


# ─────────────────────────── Endpoints ───────────────────────────

PINCODE_REGEX = re.compile(r"^\d{6}$")


@router.post("/validate-pincode", response_model=PincodeResponse)
@limiter.limit("20/minute")
def validate_pincode(
    body: PincodeRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Validate a pincode for delivery serviceability.
    Returns zone info and whether delivery is available.
    """
    pincode = body.pincode.strip()

    # Validate format
    if not PINCODE_REGEX.match(pincode):
        raise HTTPException(
            status_code=400,
            detail="Invalid pincode format. Must be exactly 6 digits.",
        )

    # Look up in DB
    zone = (
        db.query(PincodeZone)
        .filter(PincodeZone.pincode == pincode, PincodeZone.is_active == True)  # noqa: E712
        .first()
    )

    if not zone:
        return PincodeResponse(
            deliverable=False,
            zone="",
            message=f"Sorry, we don't deliver to pincode {pincode} yet.",
            delivery_charge=0,
        )

    return PincodeResponse(
        deliverable=True,
        zone=zone.zone_name,
        message=f"Delivery available to {zone.zone_name}! Free delivery on orders above ₹499.",
        delivery_charge=40,
    )
