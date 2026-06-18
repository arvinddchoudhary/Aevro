from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)  # paise, price at time of order

    # Relationships
    order = relationship("Order", back_populates="items")
    variant = relationship("ProductVariant")
