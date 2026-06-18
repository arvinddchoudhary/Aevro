"""
Seed script — populates the AEVRO database with initial product data.

Usage:
    cd backend
    python seed.py
"""

import sys
import os

# Ensure the backend directory is on the path
sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import engine, SessionLocal, Base
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.variant import ProductVariant

# Import all models so Base knows about them
import app.models  # noqa: F401


def seed():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if already seeded
        existing = db.query(Product).first()
        if existing:
            print("⚠  Database already has products — skipping seed.")
            print("   To re-seed, drop the tables first and run again.")
            return

        products_data = [
            {
                "name": "Wide-Leg Pleated Trouser",
                "slug": "wide-leg-pleated-trouser-black",
                "description": "A high-rise double-pleated wide-leg trouser in premium drape fabric. Minimal branding. Relaxed silhouette. Cut for confidence.",
                "price": 189900,
                "images": [
                    {"sort_order": 0, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-black-1.jpg"},
                    {"sort_order": 1, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-black-2.jpg"},
                    {"sort_order": 2, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-black-3.jpg"},
                    {"sort_order": 3, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-black-4.jpg"},
                ],
                "variants": [
                    {"color": "black", "size": "28", "stock": 4},
                    {"color": "black", "size": "30", "stock": 8},
                    {"color": "black", "size": "32", "stock": 10},
                    {"color": "black", "size": "34", "stock": 6},
                ],
            },
            {
                "name": "Wide-Leg Pleated Trouser",
                "slug": "wide-leg-pleated-trouser-charcoal",
                "description": "A high-rise double-pleated wide-leg trouser in premium drape fabric. Minimal branding. Relaxed silhouette. Cut for confidence.",
                "price": 189900,
                "images": [
                    {"sort_order": 0, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-charcoal-1.jpg"},
                    {"sort_order": 1, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-charcoal-2.jpg"},
                    {"sort_order": 2, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-charcoal-3.jpg"},
                    {"sort_order": 3, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-charcoal-4.jpg"},
                ],
                "variants": [
                    {"color": "charcoal", "size": "28", "stock": 4},
                    {"color": "charcoal", "size": "30", "stock": 8},
                    {"color": "charcoal", "size": "32", "stock": 10},
                    {"color": "charcoal", "size": "34", "stock": 0},
                ],
            },
            {
                "name": "Wide-Leg Pleated Trouser",
                "slug": "wide-leg-pleated-trouser-beige",
                "description": "A high-rise double-pleated wide-leg trouser in premium drape fabric. Minimal branding. Relaxed silhouette. Cut for confidence.",
                "price": 189900,
                "images": [
                    {"sort_order": 0, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-beige-1.jpg"},
                    {"sort_order": 1, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-beige-2.jpg"},
                    {"sort_order": 2, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-beige-3.jpg"},
                    {"sort_order": 3, "image_url": "https://res.cloudinary.com/demo/image/upload/v1/placeholder-beige-4.jpg"},
                ],
                "variants": [
                    {"color": "beige", "size": "28", "stock": 4},
                    {"color": "beige", "size": "30", "stock": 8},
                    {"color": "beige", "size": "32", "stock": 10},
                    {"color": "beige", "size": "34", "stock": 6},
                ],
            },
        ]

        total_variants = 0

        for p_data in products_data:
            product = Product(
                name=p_data["name"],
                slug=p_data["slug"],
                description=p_data["description"],
                price=p_data["price"],
            )
            db.add(product)
            db.flush()  # get product.id

            for img_data in p_data["images"]:
                db.add(ProductImage(
                    product_id=product.id,
                    image_url=img_data["image_url"],
                    sort_order=img_data["sort_order"],
                ))

            for var_data in p_data["variants"]:
                db.add(ProductVariant(
                    product_id=product.id,
                    color=var_data["color"],
                    size=var_data["size"],
                    stock=var_data["stock"],
                ))
                total_variants += 1

        db.commit()

        print("✓ Database seeded successfully")
        print(f"✓ {len(products_data)} products created")
        print(f"✓ {total_variants} variants created")

    except Exception as e:
        db.rollback()
        print(f"✗ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
