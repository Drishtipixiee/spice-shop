'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDeliveryCharge = useCartStore((s) => s.getDeliveryCharge);
  const getTotal = useCartStore((s) => s.getTotal);

  const itemCount = useMemo(() => getItemCount(), [items, getItemCount]);
  const subtotal = useMemo(() => getSubtotal(), [items, getSubtotal]);
  const delivery = useMemo(() => getDeliveryCharge(), [items, getDeliveryCharge]);
  const total = useMemo(() => getTotal(), [items, getTotal]);
  const freeDeliveryThreshold = 499;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const amountForFree = freeDeliveryThreshold - subtotal;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-8 bg-orange-50 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-orange-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven&apos;t added any products yet. Browse our collection of premium spices and dairy products.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shopping Cart{' '}
            <span className="text-orange-500 text-xl">({itemCount} items)</span>
          </h1>
          <Link
            href="/products"
            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              const itemId = item.variantId || `${item.productId}-${item.variant}`;

              return (
                <div
                  key={itemId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="p-4 sm:p-6 flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-orange-50">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🌶️
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {item.variant}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(itemId)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400 mr-1">₹{item.price} each</span>
                        </div>
                        <p className="text-lg font-bold text-orange-600">
                          ₹{lineTotal}
                        </p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(itemId, Math.max(1, item.quantity - 1))
                            }
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(itemId, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  {isFreeDelivery ? (
                    <span className="font-medium text-green-600 flex items-center gap-1">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        FREE
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium">₹{delivery}</span>
                  )}
                </div>
                {!isFreeDelivery && amountForFree > 0 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                    <p className="text-xs text-orange-700 font-medium">
                      🚚 Add ₹{amountForFree} more for free delivery!
                    </p>
                    <div className="mt-2 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-gray-900">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-orange-600">₹{total}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3.5 px-6 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Order via WhatsApp
                </Link>
                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white py-3.5 px-6 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg"
                >
                  Pay Online
                </Link>
              </div>

              <Link
                href="/products"
                className="block text-center mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
