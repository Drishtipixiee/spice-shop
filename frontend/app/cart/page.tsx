'use client';

import React from 'react';
import { useCartStore } from '@/store/cartStore';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully! We will contact you soon.', {
      duration: 5000,
      icon: '🎉',
    });
    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-xl border border-gray-100">
          <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-orange-500" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-lg">Looks like you haven't added any spices to your cart yet.</p>
          <Link href="/">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all hover:-translate-y-1 w-full">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Your Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-grow space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-all">
                <img src={item.image_url} alt={item.name} className="w-full sm:w-32 h-32 object-cover rounded-xl" />
                
                <div className="flex-grow text-center sm:text-left w-full">
                  <h3 className="text-xl font-bold text-gray-900 font-serif mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{item.category}</p>
                  
                  <div className="flex items-center justify-between sm:justify-start gap-8">
                    <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <span className="text-xl font-bold text-orange-600">₹{item.price * item.quantity}</span>
                  </div>
                </div>

                <button onClick={() => removeFromCart(item.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all self-end sm:self-center">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-24">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900">{deliveryFee === 0 ? <span className="text-green-500 font-bold">FREE</span> : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg text-center">
                    Add ₹{(500 - subtotal).toFixed(2)} more to get FREE delivery!
                  </p>
                )}
                <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-black text-orange-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-orange-600 to-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
              >
                Place Order <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
