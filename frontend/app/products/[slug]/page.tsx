'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  MessageCircle,
  Circle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import VariantSwitcher from '@/components/VariantSwitcher';
import ProductCard from '@/components/ProductCard';
import { getProductBySlug, getProducts } from '@/lib/api';
import type { Product, ProductVariant } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { buildWhatsAppOrderMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import type { WhatsAppOrderData } from '@/lib/whatsapp';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }

        // Fetch related products
        const categorySlug = data.category?.slug || data.category_slug || '';
        if (categorySlug) {
          try {
            const allProducts = await getProducts({ category: categorySlug });
            const related = allProducts
              .filter(
                (p: Product) =>
                  (p.slug || p.id) !== (data.slug || data.id)
              )
              .slice(0, 4);
            setRelatedProducts(related);
          } catch {
            console.error('Failed to fetch related products');
          }
        }
      } catch {
        console.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const max = selectedVariant?.stock_qty ?? 99;
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > max) return max;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWhatsAppOrder = () => {
    if (!product || !selectedVariant) return;
    const orderData: WhatsAppOrderData = {
      items: [
        {
          name: product.name,
          variant: selectedVariant.weight_label || selectedVariant.label || '',
          quantity,
          price: selectedVariant.price_inr,
        },
      ],
      subtotal: selectedVariant.price_inr * quantity,
      delivery: selectedVariant.price_inr * quantity >= 499 ? 0 : 40,
      total:
        selectedVariant.price_inr * quantity +
        (selectedVariant.price_inr * quantity >= 499 ? 0 : 40),
    };
    const message = buildWhatsAppOrderMessage(orderData);
    const url = getWhatsAppUrl(message);
    window.open(url, '_blank');
  };

  const stockQty = selectedVariant?.stock_qty ?? 0;
  const isOutOfStock = stockQty <= 0;
  const price = selectedVariant?.price_inr ?? 0;
  const mrp = selectedVariant?.mrp_inr ?? 0;
  const savings = mrp > price ? mrp - price : 0;
  const savingsPercent = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-12 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Product not found</h2>
          <Link
            href="/products"
            className="text-orange-600 hover:underline font-medium"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = product.category?.name || 'Products';
  const categorySlug = product.category?.slug || product.category_slug || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-orange-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <Link href="/products" className="hover:text-orange-600 transition-colors">
            Products
          </Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          {categorySlug && (
            <>
              <Link
                href={`/products?category=${categorySlug}`}
                className="hover:text-orange-600 transition-colors"
              >
                {categoryName}
              </Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </>
          )}
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column - Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
              {!imageError && product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <span className="text-8xl">
                    {categoryName.toLowerCase().includes('dairy') ? '🥛' : '🌶️'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Category badge */}
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              {categoryName}
            </span>

            {/* Product name */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Variant Switcher */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <VariantSwitcher
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onSelect={(variant) => {
                    setSelectedVariant(variant);
                    setQuantity(1);
                  }}
                />
              </div>
            )}

            {/* Price section */}
            <div key={selectedVariant?.id} className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100 animate-fade-slide-up">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-orange-600">
                  ₹{price}
                </span>
                {mrp > price && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{mrp}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                  Save ₹{savings} — {savingsPercent}% off
                </span>
              )}
            </div>

            {/* Stock Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {stockQty > 10 ? (
                <>
                  <Circle className="w-3 h-3 fill-green-500 text-green-500" />
                  <span className="text-sm font-medium text-green-700">In Stock</span>
                </>
              ) : stockQty > 0 ? (
                <>
                  <Circle className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">
                    Only {stockQty} left
                  </span>
                </>
              ) : (
                <>
                  <Circle className="w-3 h-3 fill-red-500 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-gray-900 font-semibold border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= stockQty || isOutOfStock}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleWhatsAppOrder}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Order on WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id || rp.slug} product={rp} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
