from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    price = Column(Integer, nullable=False)  # stored in paise (189900 = ₹1,899)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    images = relationship("ProductImage", back_populates="product", order_by="ProductImage.sort_order")
    variants = relationship("ProductVariant", back_populates="product")
