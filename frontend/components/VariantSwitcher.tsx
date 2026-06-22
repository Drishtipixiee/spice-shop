'use client';

import React from 'react';
import type { ProductVariant } from '@/lib/api';

interface VariantSwitcherProps {
  variants: ProductVariant[];
  selectedVariantId: number;
  onSelect: (variantId: number) => void;
}

export default function VariantSwitcher({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSwitcherProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const isSelected = variant.id === selectedVariantId;
        const isOutOfStock = variant.stock_qty <= 0;

        return (
          <button
            key={variant.id}
            onClick={() => onSelect(variant.id)}
            disabled={isOutOfStock}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${
                isSelected
                  ? 'bg-saffron-500 text-white shadow-md shadow-saffron-200'
                  : isOutOfStock
                  ? 'border border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50 line-through'
                  : 'border border-saffron-300 text-saffron-700 hover:bg-saffron-50 hover:border-saffron-400'
              }
            `}
          >
            {variant.weight_label}
            {isOutOfStock && !isSelected && (
              <span className="ml-1 text-xs">(Sold out)</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
