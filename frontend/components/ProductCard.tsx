'use client';

import { useCartStore } from '@/store/cartStore';
import { Product } from '@/lib/api';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore(state => state.addToCart);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      icon: '🌶️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-orange-100 flex flex-col h-full">
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img 
          src={product.image_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-orange-600 shadow-sm border border-orange-100">
          {product.category}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-orange-600">₹{product.price}</span>
            <span className="text-xs text-gray-400 font-medium">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 group"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        </div>
      </div>
    </div>
  );
}
