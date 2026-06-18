import hmac
import hashlib

import razorpay

from app.core.config import settings


def get_razorpay_client() -> razorpay.Client:
    """Return an initialised Razorpay client."""
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def create_razorpay_order(amount: int, receipt: str) -> dict:
    """Create a Razorpay order and return the response dict.

    Args:
        amount: Amount in paise.
        receipt: A reference string (e.g. order_number).
    """
    client = get_razorpay_client()
    return client.order.create(
        {
            "amount": amount,
            "currency": "INR",
            "receipt": receipt,
        }
    )


def verify_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    signature: str,
) -> bool:
    """Verify Razorpay payment signature using HMAC-SHA256.

    Returns True if the signature is valid, False otherwise.
    """
    message = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
