export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  priceInPaise: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  imageUrl?: string;
}
