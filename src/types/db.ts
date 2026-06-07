/**
 * App-facing domain types (camelCase).
 * The Supabase tables are snake_case; query helpers in lib/queries.ts map
 * DB rows into these shapes so the rest of the app stays clean.
 *
 * All monetary values are integer PAISE (₹1 = 100 paise).
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "razorpay" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  name: string;
  slug: string;
  description: string | null;
  /** price in paise */
  price: number;
  /** optional MRP/strike-through price in paise */
  comparePrice: number | null;
  images: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface Review {
  id: string;
  productId: string | null;
  authorName: string;
  rating: number; // 1..5
  body: string;
  photoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface InstagramPost {
  id: string;
  postUrl: string;
  embedHtml: string | null;
  caption: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface SiteSettings {
  storeName: string;
  contactPhone: string;
  contactEmail: string | null;
  instagramUrl: string | null;
  /** flat shipping fee in paise */
  flatShippingFee: number;
  /** orders at/above this paise subtotal ship free; null = never free */
  freeShippingThreshold: number | null;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  announcementText: string | null;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number; // paise (display only; re-priced server-side)
  image: string | null;
  quantity: number;
  stock: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  unitPrice: number; // paise
  quantity: number;
  lineTotal: number; // paise
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  notes: string | null;
  createdAt: string;
  items?: OrderItem[];
}
