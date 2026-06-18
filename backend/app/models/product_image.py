from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)

    # Relationships
    product = relationship("Product", back_populates="images")
