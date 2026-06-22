'use client';

import { useCartStore } from '@/store/cartStore';
import { Product } from '@/lib/api';
import { ShoppingCart, Leaf, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore(state => state.addToCart);

  // Use the first variant for price and stock if available
  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const price = defaultVariant ? defaultVariant.price_inr : 0;
  const stock = defaultVariant ? defaultVariant.stock_qty : 0;
  const categoryName = product.category ? product.category.name : 'Spice';

  const handleAddToCart = () => {
    // We map to the old cart structure for now
    addToCart({
      id: String(product.id),
      name: product.name,
      price: price,
      stock: stock,
      image_url: product.image_url || '',
      category: categoryName,
      description: product.description || '',
      is_featured: product.is_featured,
    } as any);
    
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
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-shadow duration-300 overflow-hidden group border border-orange-50 flex flex-col h-full relative"
    >
      {/* Badges */}
      {product.is_featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform -rotate-2">
          <Zap className="w-3 h-3 fill-current" />
          Featured
        </div>
      )}

      <div className="relative h-56 sm:h-64 overflow-hidden bg-gray-100 cursor-pointer">
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={product.image_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-orange-600 shadow-sm border border-orange-100 flex items-center gap-1">
          <Leaf className="w-3 h-3" />
          {categoryName}
        </div>
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
           <button 
             onClick={handleAddToCart}
             disabled={stock <= 0}
             className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-2xl font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
           >
             <ShoppingCart className="w-5 h-5" />
             {stock > 0 ? 'Quick Add to Cart' : 'Out of Stock'}
           </button>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow bg-white">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">{product.description}</p>
        
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400 font-medium mb-1">Starting from</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-gray-900">₹{price}</span>
              {defaultVariant && defaultVariant.mrp_inr > price && (
                <span className="text-sm text-gray-400 line-through">₹{defaultVariant.mrp_inr}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
