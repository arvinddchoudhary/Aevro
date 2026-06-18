from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.db.database import get_db
from app.models.product import Product
from app.models.variant import ProductVariant
from app.schemas.product import ProductSchema, ProductListSchema

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=list[ProductListSchema])
def get_products(
    color: Optional[str] = Query(None),
    size: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Get all products with optional color/size filtering."""
    query = db.query(Product).options(
        joinedload(Product.images),
        joinedload(Product.variants),
    )

    if color:
        query = query.filter(
            Product.variants.any(ProductVariant.color == color)
        )

    if size:
        query = query.filter(
            Product.variants.any(ProductVariant.size == size)
        )

    products = query.distinct().all()
    return products


@router.get("/{slug}", response_model=ProductSchema)
def get_product(slug: str, db: Session = Depends(get_db)):
    """Get a single product by slug with all images and variants."""
    product = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.variants),
        )
        .filter(Product.slug == slug)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product
