import data from './data.json';

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
  let products = data.products as Product[];

  if (categorySlug) {
    const category = data.categories.find(c => c.slug === categorySlug);
    if (category) {
      products = products.filter(p => p.category_id === category.id);
    } else {
      products = [];
    }
  }

  if (featured) {
    products = products.filter(p => p.is_featured);
  }

  if (search) {
    products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
  }

  // Inject categories
  return products.map(p => ({
    ...p,
    category: data.categories.find(c => c.id === p.category_id) as Category
  }));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const product = data.products.find(p => p.slug === slug) as Product | undefined;
  if (!product) return null;

  return {
    ...product,
    category: data.categories.find(c => c.id === product.category_id) as Category
  };
}

export async function getCategories(): Promise<Category[]> {
  return data.categories as Category[];
}

export async function validatePincode(pincode: string) {
  // Simple mock for validation
  const validRegex = /^[1-9][0-9]{5}$/;
  if (!validRegex.test(pincode)) {
    return { deliverable: false, message: 'Invalid format' };
  }
  return { 
    deliverable: true, 
    zone: 'India', 
    message: 'Delivery available', 
    delivery_charge: 40 
  };
}

export async function createOrder(orderData: any) {
  // Since we are serverless and free, we just return a mock success for now
  return {
    order_id: 'ORD-' + Math.floor(Math.random() * 1000000),
    whatsapp_url: `https://wa.me/919999999999?text=${encodeURIComponent('Hello! I would like to place an order...')}`,
    total: 0,
    status: 'pending'
  };
}
