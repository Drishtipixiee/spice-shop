'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const cheapestVariant = product.variants.length > 0
    ? product.variants.reduce((min, v) => (v.price_inr < min.price_inr ? v : min), product.variants[0])
    : null;

  const lowestPrice = cheapestVariant?.price_inr ?? 0;
  const mrpPrice = cheapestVariant?.mrp_inr ?? 0;
  const savingsPercent = mrpPrice > 0 ? Math.round(((mrpPrice - lowestPrice) / mrpPrice) * 100) : 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!cheapestVariant) {
      toast.error('No variants available');
      return;
    }

    if (cheapestVariant.stock_qty <= 0) {
      toast.error('Out of stock');
      return;
    }

    addItem({
      variant_id: cheapestVariant.id,
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      product_image: product.image_url,
      variant_label: cheapestVariant.weight_label,
      price: cheapestVariant.price_inr,
      mrp: cheapestVariant.mrp_inr,
      stock: cheapestVariant.stock_qty,
    });

    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '8px',
        background: '#333',
        color: '#fff',
      },
    });
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover shadow-sm">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-saffron-50 to-orange-50">
          {!imageError && product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-saffron-100 to-orange-100">
              <span className="text-5xl">🌶️</span>
            </div>
          )}

          {/* Category Badge */}
          {product.category && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              {product.category.name}
            </span>
          )}

          {/* Savings Badge */}
          {savingsPercent > 0 && (
            <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              {savingsPercent}% OFF
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-gray-800 font-semibold text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-saffron-600 transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            {cheapestVariant ? (
              <>
                <span className="text-saffron-600 font-bold text-lg">
                  From ₹{lowestPrice.toFixed(0)}
                </span>
                {mrpPrice > lowestPrice && (
                  <span className="text-gray-400 text-sm line-through">
                    ₹{mrpPrice.toFixed(0)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm">Price unavailable</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!cheapestVariant || cheapestVariant.stock_qty <= 0}
            className="w-full flex items-center justify-center gap-2 bg-saffron-500 hover:bg-saffron-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 btn-press text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            {cheapestVariant && cheapestVariant.stock_qty > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </Link>
  );
}
