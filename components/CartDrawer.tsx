'use client';

import React from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDeliveryCharge = useCartStore((state) => state.getDeliveryCharge);
  const getTotal = useCartStore((state) => state.getTotal);

  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryCharge();
  const total = getTotal();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[70] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-saffron-500" />
            Your Cart
            {items.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
            <div className="w-20 h-20 bg-saffron-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-saffron-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Add some delicious spices and dairy products to get started!
            </p>
            <Link
              href="/products"
              onClick={onClose}
              className="px-6 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-medium rounded-lg transition-colors btn-press text-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;

                return (
                  <div
                    key={item.variant_id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg animate-fade-in"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-saffron-50 to-orange-50 flex-shrink-0">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🌶️</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variant_label} · ₹{item.price.toFixed(0)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.variant_id, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variant_id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">
                            ₹{lineTotal.toFixed(0)}
                          </span>
                          <button
                            onClick={() => removeItem(item.variant_id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">₹{subtotal.toFixed(0)}</span>
              </div>

              {/* Delivery Charge */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : 'font-medium text-gray-800'}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>

              {deliveryCharge > 0 && (
                <p className="text-xs text-saffron-600">
                  Add ₹{(499 - subtotal).toFixed(0)} more for free delivery!
                </p>
              )}

              {/* Total */}
              <div className="flex items-center justify-between text-base font-bold pt-2 border-t border-gray-100">
                <span className="text-gray-900">Total</span>
                <span className="text-saffron-600">₹{total.toFixed(0)}</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex-1 text-center px-4 py-2.5 border border-saffron-500 text-saffron-600 hover:bg-saffron-50 font-medium rounded-lg transition-colors text-sm btn-press"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex-1 text-center px-4 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-medium rounded-lg transition-colors text-sm btn-press"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
