export type ProductImage = {
  url: string;
  publicId: string;
  alt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  categoryId: string;
  categorySlug: string;
  images: ProductImage[];
  image: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  categoryId: string;
  images: ProductImage[];
  isActive?: boolean;
  rating?: number;
  reviewCount?: number;
};

export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "unpaid" | "paid";

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: { productId: string; name: string; qty: number; priceAtPurchase: number }[];
  shippingAddress: string;
  shippingAddressDetails?: {
    address: string;
    address2?: string;
    city: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: "COD";
  paid: boolean;
  notes?: string;
  statusHistory: { status: OrderStatus; at: string }[];
  createdAt: string;
};
