// Use NEXT_PUBLIC_API_URL if set (for external backend), otherwise use built-in Next.js API routes
const API_URL = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'undefined')
  ? process.env.NEXT_PUBLIC_API_URL
  : '/api';

export interface ProductVariant {
  id: number;
  weight_label: string;
  label?: string;
  price_inr: number;
  mrp_inr: number;
  stock_qty: number;
  sku: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
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
  category_slug?: string;
  variants: ProductVariant[];
  price_inr?: number;
  created_at?: string;
}

export async function getProducts(params?: { category?: string; featured?: boolean; search?: string }): Promise<Product[]> {
  try {
    let url = `${API_URL}/products`;
    const queryParts: string[] = [];
    if (params?.category) queryParts.push(`category_slug=${encodeURIComponent(params.category)}`);
    if (params?.featured) queryParts.push('featured=true');
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (queryParts.length > 0) url += '?' + queryParts.join('&');
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    return res.json();
  } catch {
    return [];
  }
}

export async function getProductById(idOrSlug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${idOrSlug}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed');
    return res.json();
  } catch {
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return getProductById(slug);
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    return res.json();
  } catch {
    return [];
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  return getProducts({ search: query });
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return getProducts({ category });
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
