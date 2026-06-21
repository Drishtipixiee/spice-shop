import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export default api;

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  description: string;
  product_count?: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  weight_label: string;
  price_inr: number;
  mrp_inr: number;
  stock_qty: number;
  sku: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  variants: ProductVariant[];
  category?: Category;
}

export interface PincodeResult {
  deliverable: boolean;
  zone: string;
  message: string;
  delivery_charge: number;
}

export interface OrderItem {
  id: number;
  product_name: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  address: string;
  pincode: string;
  zone_name: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: string;
  payment_method: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderResult {
  order_id: number;
  whatsapp_url?: string;
  total: number;
  status: string;
}

export interface Stats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  total_products: number;
  top_products: { name: string; total_qty_sold: number }[];
}

// ─── Helper: Get Admin Auth Header ──────────────────────────────────────────

function getAdminHeaders(): { Authorization: string } {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  return { Authorization: `Bearer ${token || ''}` };
}

// ─── Public API Functions ───────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories');
  return response.data;
}

export async function getProducts(params?: {
  category_id?: number;
  search?: string;
  is_featured?: boolean;
  skip?: number;
  limit?: number;
}): Promise<Product[]> {
  const response = await api.get<Product[]>('/products', { params });
  return response.data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${slug}`);
  return response.data;
}

export async function validatePincode(pincode: string): Promise<PincodeResult> {
  const response = await api.post<PincodeResult>('/validate-pincode', { pincode });
  return response.data;
}

export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  address: string;
  pincode: string;
  payment_method: string;
  items: { variant_id: number; quantity: number }[];
}): Promise<OrderResult> {
  const response = await api.post<OrderResult>('/orders', data);
  return response.data;
}

export async function getOrder(id: number): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
}

// ─── Admin API Functions ────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<{ token: string }> {
  const response = await api.post<{ token: string }>('/admin/login', { email, password });
  return response.data;
}

export async function getAdminStats(): Promise<Stats> {
  const response = await api.get<Stats>('/admin/stats', {
    headers: getAdminHeaders(),
  });
  return response.data;
}

export async function getAdminOrders(params?: {
  status?: string;
  skip?: number;
  limit?: number;
}): Promise<Order[]> {
  const response = await api.get<Order[]>('/admin/orders', {
    headers: getAdminHeaders(),
    params,
  });
  return response.data;
}

export async function updateOrderStatus(id: number, status: string): Promise<void> {
  await api.patch(`/admin/orders/${id}/status`, { status }, {
    headers: getAdminHeaders(),
  });
}

export async function getAdminProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/admin/products', {
    headers: getAdminHeaders(),
  });
  return response.data;
}

export async function createAdminProduct(data: {
  name: string;
  slug: string;
  category_id: number;
  description: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  variants: { weight_label: string; price_inr: number; mrp_inr: number; stock_qty: number; sku: string }[];
}): Promise<Product> {
  const response = await api.post<Product>('/admin/products', data, {
    headers: getAdminHeaders(),
  });
  return response.data;
}

export async function updateAdminProduct(id: number, data: {
  name?: string;
  slug?: string;
  category_id?: number;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  is_featured?: boolean;
  variants?: { weight_label: string; price_inr: number; mrp_inr: number; stock_qty: number; sku: string }[];
}): Promise<Product> {
  const response = await api.put<Product>(`/admin/products/${id}`, data, {
    headers: getAdminHeaders(),
  });
  return response.data;
}

export async function deleteAdminProduct(id: number): Promise<void> {
  await api.delete(`/admin/products/${id}`, {
    headers: getAdminHeaders(),
  });
}
