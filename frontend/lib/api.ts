import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  is_featured: boolean;
  created_at?: string;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as Product;
}

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase.from('categories').select('name');
  if (error) throw error;
  return data.map(c => c.name);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  if (error) throw error;
  return data as Product[];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('category', category);
  if (error) throw error;
  return data as Product[];
}

// ADMIN FUNCTIONS
export async function createAdminProduct(productData: Omit<Product, 'id'>) {
  const { data, error } = await supabase.from('products').insert([productData]).select();
  if (error) throw error;
  return { success: true, data };
}

export async function updateAdminProduct(id: string, productData: Partial<Product>) {
  const { data, error } = await supabase.from('products').update(productData).eq('id', id).select();
  if (error) throw error;
  return { success: true, data };
}

export async function deleteAdminProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
}

export async function getAdminProducts(): Promise<Product[]> {
  return getProducts();
}

export async function getAdminStats() {
  return { 
    totalOrders: 0, 
    todaysRevenue: 0, 
    pendingOrders: 0, 
    totalProducts: 0, 
    recentOrders: [],
    topProducts: []
  };
}
export interface Stats { 
  totalOrders: number; 
  todaysRevenue: number; 
  pendingOrders: number; 
  totalProducts: number; 
  recentOrders: any[]; 
  topProducts: any[];
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
export async function getProductBySlug(slug: string) { return getProductById(slug); }

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

export async function validatePincode(pincode: string): Promise<PincodeResult> { return { valid: true, cod_available: true, estimated_days: 3, deliverable: true, pincode, city: 'Mumbai', state: 'Maharashtra' }; }
export async function createOrder(orderData: any) { return { order_id: 'ORD-' + Math.floor(Math.random() * 1000000), whatsapp_url: `https://wa.me/919999999999?text=${encodeURIComponent('Hello! I would like to place an order...')}`, total: 0, status: 'pending' }; }
