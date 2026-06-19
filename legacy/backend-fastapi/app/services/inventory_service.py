from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.variant import ProductVariant


def decrement_stock(db: Session, variant_id: int, quantity: int) -> ProductVariant:
    """Decrement stock for a variant. Raises 400 if insufficient stock.

    Args:
        db: Database session.
        variant_id: ID of the product variant.
        quantity: Number of units to subtract.

    Returns:
        The updated ProductVariant instance.
    """
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    if variant.stock < quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock for variant {variant_id}",
        )

    variant.stock -= quantity
    db.commit()
    db.refresh(variant)
    return variant


def check_stock(db: Session, variant_id: int, quantity: int) -> bool:
    """Check if a variant has enough stock.

    Returns True if stock >= quantity, False otherwise.
    """
    variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    if not variant:
        return False

    return variant.stock >= quantity
