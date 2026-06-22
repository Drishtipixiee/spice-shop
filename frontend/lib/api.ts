const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ProductVariant {
  id: number;
  weight_label: string;
  price_inr: number;
  mrp_inr: number;
  stock_qty: number;
  sku: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  category: Category;
  variants: ProductVariant[];
  created_at?: string;
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProductById(idOrSlug: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${idOrSlug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return getProductById(slug);
}

export async function getCategories(): Promise<string[]> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data: Category[] = await res.json();
  return data.map(c => c.name);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search products');
  return res.json();
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products?category_slug=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error('Failed to fetch category products');
  return res.json();
}

// ADMIN FUNCTIONS
export async function createAdminProduct(productData: any) { return { success: true, data: null }; }
export async function updateAdminProduct(id: string, productData: any) { return { success: true, data: null }; }
export async function deleteAdminProduct(id: string) { return { success: true }; }
export async function getAdminProducts(): Promise<Product[]> { return getProducts(); }

export interface Stats { 
  totalOrders: number; 
  todaysRevenue: number; 
  pendingOrders: number; 
  totalProducts: number; 
  recentOrders: any[]; 
  topProducts: any[];
}
export async function getAdminStats(): Promise<Stats> {
  return { 
    totalOrders: 0, todaysRevenue: 0, pendingOrders: 0, totalProducts: 0, recentOrders: [], topProducts: []
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id?: string;
  product_name: string;
  productName: string;
  productImage?: string;
  variant_label?: string;
  variantLabel?: string;
  quantity: number;
  unit_price: number;
  unitPrice?: number;
  price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customerName: string;
  customer_phone: string;
  customerPhone: string;
  address: string;
  deliveryAddress: string;
  pincode: string;
  zone_name: string;
  subtotal: number;
  delivery_charge: number;
  deliveryCharge: number;
  total: number;
  status: string;
  payment_method: string;
  paymentMethod: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  createdAt: string;
  items: OrderItem[];
}

export async function getAdminOrders(): Promise<Order[]> { return []; }
export async function updateOrderStatus(id: string, status: string) { return { success: true }; }
export async function getOrder(id: string) { return null; }

export interface PincodeResult {
  valid: boolean;
  cod_available?: boolean;
  estimated_days?: number;
  message?: string;
  deliverable: boolean;
  pincode?: string;
  city?: string;
  state?: string;
}

export async function validatePincode(pincode: string): Promise<PincodeResult> { 
  return { valid: true, cod_available: true, estimated_days: 3, deliverable: true, pincode, city: 'Mumbai', state: 'Maharashtra' }; 
}
export async function createOrder(orderData: any) { 
  return { order_id: 'ORD-' + Math.floor(Math.random() * 1000000), whatsapp_url: `https://wa.me/919999999999?text=${encodeURIComponent('Hello! I would like to place an order...')}`, total: 0, status: 'pending' }; 
}
