'use client';

import React, { useEffect, useState } from 'react';
import { getProducts, getCategories, searchProducts, getProductsByCategory, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Search, Flame, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, catData] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prodData);
        setCategories(['All', ...catData]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function filterData() {
      setLoading(true);
      try {
        if (searchQuery) {
          const data = await searchProducts(searchQuery);
          setProducts(data);
        } else if (activeCategory !== 'All') {
          const data = await getProductsByCategory(activeCategory);
          setProducts(data);
        } else {
          const data = await getProducts();
          setProducts(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    const timeoutId = setTimeout(() => {
      filterData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-800/30 text-white text-sm font-semibold mb-6 backdrop-blur-sm border border-orange-400/30">
              <Sparkles className="w-4 h-4 text-orange-200" />
              100% Authentic Indian Spices
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 font-serif tracking-tight drop-shadow-md">
              Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-200">Magic</span> of India
            </h1>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Elevate your cooking with our premium, hand-picked spices sourced directly from the finest farms across the subcontinent.
            </p>
            
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search for turmeric, garam masala, chili..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 rounded-full border-0 text-gray-900 bg-white shadow-2xl focus:ring-4 focus:ring-orange-300 transition-all text-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Categories */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-12 flex items-center gap-3 overflow-x-auto no-scrollbar border border-orange-50">
          <Flame className="w-6 h-6 text-orange-500 shrink-0 ml-2" />
          <div className="w-px h-8 bg-gray-200 shrink-0 mx-2"></div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                activeCategory === cat 
                  ? 'bg-orange-500 text-white shadow-orange-200 scale-105' 
                  : 'bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            {searchQuery ? 'Search Results' : activeCategory === 'All' ? 'Our Finest Selection' : `${activeCategory} Spices`}
          </h2>
          <span className="text-gray-500 font-medium">{products.length} Items</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
          </div>
        ) : products.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="text-6xl mb-4">🌶️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No spices found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-6 text-orange-600 font-semibold hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
