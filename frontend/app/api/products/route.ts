import { NextResponse } from 'next/server';
import data from '../../../lib/data.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category_slug');
  const featured = searchParams.get('featured');
  const search = searchParams.get('search');

  let products = data.products;

  if (categorySlug) {
    const category = data.categories.find(c => c.slug === categorySlug);
    if (category) {
      products = products.filter(p => p.category_id === category.id);
    } else {
      products = [];
    }
  }

  if (featured === 'true') {
    products = products.filter(p => p.is_featured);
  }

  if (search) {
    products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
  }

  // Inject category info
  products = products.map(p => ({
    ...p,
    category: data.categories.find(c => c.id === p.category_id)
  }));

  return NextResponse.json(products);
}
