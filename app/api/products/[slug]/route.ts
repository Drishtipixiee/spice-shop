import { NextResponse } from 'next/server';
import data from '../../../../lib/data.json';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const product = data.products.find(p => p.slug === params.slug);
  
  if (!product) {
    return NextResponse.json({ detail: "Product not found" }, { status: 404 });
  }

  // Inject category info
  const productWithCategory = {
    ...product,
    category: data.categories.find(c => c.id === product.category_id)
  };

  return NextResponse.json(productWithCategory);
}
