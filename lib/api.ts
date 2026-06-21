import { supabase } from './supabaseClient';

export interface Variant {
  id: number;
  weight_label: string;
  price_inr: number;
  mrp_inr: number;
  stock_qty: number;
  sku: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  category_id: number;
  variants: Variant[];
  category?: Category;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  image_url: string;
  description: string;
  product_count?: number;
}

export async function getProducts(categorySlug?: string, featured?: boolean, search?: string): Promise<Product[]> {
  let query = supabase.from('products').select(`*, variants(*), category:categories(*)`);

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (featured) {
    query = query.eq('is_featured', true);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  return data as unknown as Product[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select(`*, variants(*), category:categories(*)`).eq('slug', slug).single();
  if (error || !data) return null;
  return data as unknown as Product;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return [];
  return data as Category[];
}

export async function validatePincode(pincode: string) {
  const validRegex = /^[1-9][0-9]{5}$/;
  if (!validRegex.test(pincode)) return { deliverable: false, message: 'Invalid format' };
  return { deliverable: true, zone: 'India', message: 'Delivery available', delivery_charge: 40 };
}

export async function createOrder(orderData: any) {
  return {
    order_id: 'ORD-' + Math.floor(Math.random() * 1000000),
    whatsapp_url: `https://wa.me/919999999999?text=${encodeURIComponent('Hello! I would like to place an order...')}`,
    total: 0,
    status: 'pending'
  };
}

export async function getAdminProducts(): Promise<Product[]> {
  const { data } = await supabase.from('products').select(`*, variants(*), category:categories(*)`);
  return (data as unknown as Product[]) || [];
}

export async function createAdminProduct(productData: any) {
  return { success: true };
}

export async function updateAdminProduct(id: number, productData: any) {
  return { success: true };
}

export async function deleteAdminProduct(id: number) {
  return { success: true };
}

export async function getAdminStats() {
  return { 
    totalOrders: 0, 
    todaysRevenue: 0, 
    pendingOrders: 0, 
    totalProducts: 0, 
    recentOrders: [] 
  };
}
export interface Stats { 
  totalOrders: number; 
  todaysRevenue: number; 
  pendingOrders: number; 
  totalProducts: number; 
  recentOrders: any[]; 
}

export async function getAdminOrders() {
  return [];
}

export async function updateOrderStatus(id: number, status: string) {
  return { success: true };
}

export async function getOrder(id: string) {
  return null;
}

export async function getProductBySlug(slug: string) {
  return getProduct(slug);
}
