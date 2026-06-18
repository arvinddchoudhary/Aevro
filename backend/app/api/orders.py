from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreateSchema, OrderResponseSchema

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=OrderResponseSchema)
def create_order(payload: OrderCreateSchema, db: Session = Depends(get_db)):
    """Create a new order with line items."""
    # Create the order
    order = Order(
        order_number="",  # placeholder, updated after flush
        customer_name=payload.customer_name,
        phone=payload.phone,
        email=payload.email,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        total_amount=payload.total_amount,
        payment_status="pending",
        order_status="placed",
    )
    db.add(order)
    db.flush()  # assigns order.id

    # Generate order number from id: AEVRO-001, AEVRO-012, etc.
    order.order_number = f"AEVRO-{order.id:03d}"

    # Create order items
    for item in payload.items:
        order_item = OrderItem(
            order_id=order.id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            price=item.price,
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}", response_model=OrderResponseSchema)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a single order by id."""
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order
