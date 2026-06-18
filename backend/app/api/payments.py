import hmac
import hashlib

import razorpay
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.variant import ProductVariant
from app.schemas.order import PaymentCreateSchema, PaymentVerifySchema

router = APIRouter(prefix="/payments", tags=["payments"])

# Initialise Razorpay client once
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


@router.post("/create-order")
def create_razorpay_order(
    payload: PaymentCreateSchema, db: Session = Depends(get_db)
):
    """Create a Razorpay order for the given internal order."""
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Create Razorpay order
    razorpay_order = razorpay_client.order.create(
        {
            "amount": order.total_amount,  # already in paise
            "currency": "INR",
            "receipt": order.order_number,
        }
    )

    # Save Razorpay order id back to our order
    order.razorpay_order_id = razorpay_order["id"]
    db.commit()

    return {
        "razorpay_order_id": razorpay_order["id"],
        "amount": order.total_amount,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
    }


@router.post("/verify")
def verify_payment(payload: PaymentVerifySchema, db: Session = Depends(get_db)):
    """Verify Razorpay payment signature and mark order as paid."""
    # HMAC-SHA256 signature verification
    message = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Update order status
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.payment_status = "paid"
    order.razorpay_payment_id = payload.razorpay_payment_id

    # Decrement stock for each order item
    order_items = (
        db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    )
    for item in order_items:
        variant = (
            db.query(ProductVariant)
            .filter(ProductVariant.id == item.variant_id)
            .first()
        )
        if variant:
            variant.stock = variant.stock - item.quantity

    db.commit()

    return {
        "success": True,
        "order_id": order.id,
        "order_number": order.order_number,
    }
