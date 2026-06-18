from pydantic import BaseModel


class ProductImageSchema(BaseModel):
    id: int
    image_url: str
    sort_order: int

    model_config = {"from_attributes": True}


class ProductVariantSchema(BaseModel):
    id: int
    color: str
    size: str
    stock: int

    model_config = {"from_attributes": True}


class ProductSchema(BaseModel):
    """Full product detail with images and variants."""

    id: int
    name: str
    slug: str
    description: str | None = None
    price: int  # stored in paise (189900 = ₹1,899)
    images: list[ProductImageSchema] = []
    variants: list[ProductVariantSchema] = []

    model_config = {"from_attributes": True}


class ProductListSchema(BaseModel):
    """Lightweight schema for the product grid."""

    id: int
    name: str
    slug: str
    price: int
    images: list[ProductImageSchema] = []
    variants: list[ProductVariantSchema] = []

    model_config = {"from_attributes": True}
