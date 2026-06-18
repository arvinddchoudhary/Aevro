from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_number = Column(String, unique=True, nullable=False)  # format "AEVRO-001"
    customer_name = Column(String(255))
    phone = Column(String(20))
    email = Column(String(255))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    total_amount = Column(Integer)  # stored in paise
    payment_status = Column(String, default="pending")    # pending / paid / failed
    order_status = Column(String, default="placed")       # placed / processing / shipped / delivered
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    items = relationship("OrderItem", back_populates="order")
