from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    color = Column(String(50))   # "black", "charcoal", "beige"
    size = Column(String(10))    # "28", "30", "32", "34"
    stock = Column(Integer, default=0)

    # Relationships
    product = relationship("Product", back_populates="variants")
