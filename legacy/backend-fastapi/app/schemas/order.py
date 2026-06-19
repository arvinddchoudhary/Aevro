from datetime import datetime
from pydantic import BaseModel


# --- Order Creation (incoming from frontend) ---

class OrderItemCreateSchema(BaseModel):
    variant_id: int
    quantity: int
    price: int  # paise, price at time of order


class OrderCreateSchema(BaseModel):
    """Full checkout form submission."""

    customer_name: str
    phone: str
    email: str
    address: str
    city: str
    state: str
    pincode: str
    items: list[OrderItemCreateSchema]
    total_amount: int  # paise


# --- Order Response ---

class OrderResponseSchema(BaseModel):
    """Returned after order creation."""

    id: int
    order_number: str
    customer_name: str
    phone: str
    email: str
    total_amount: int
    payment_status: str
    order_status: str
    razorpay_order_id: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Payment ---

class PaymentCreateSchema(BaseModel):
    """Frontend requests a Razorpay order."""

    order_id: int
    amount: int  # paise


class PaymentVerifySchema(BaseModel):
    """Frontend sends after Razorpay payment success callback."""

    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: int
