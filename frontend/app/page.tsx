'use client';

import React, { useEffect, useState } from 'react';
import { getProducts, getCategories, searchProducts, getProductsByCategory, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Search, Flame, Loader2, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_SLIDES = [
  {
    id: 1,
    title: "Discover the Magic of India",
    subtitle: "100% Authentic Indian Spices",
    description: "Elevate your cooking with our premium, hand-picked spices sourced directly from the finest farms across the subcontinent.",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop",
    color: "from-orange-600 via-orange-500 to-red-600"
  },
  {
    id: 2,
    title: "The Golden Spice",
    subtitle: "Premium Lakadong Turmeric",
    description: "Known for its high curcumin content, our Lakadong Turmeric brings unparalleled health benefits and a rich golden hue.",
    image: "https://images.unsplash.com/photo-1615486171448-4fd6d17b5f25?q=80&w=2070&auto=format&fit=crop",
    color: "from-yellow-600 via-yellow-500 to-orange-500"
  },
  {
    id: 3,
    title: "Fiery Red Chilli",
    subtitle: "Guntur Sannam",
    description: "Add the perfect kick to your dishes with our sun-dried, vibrant red chillies from the heart of Guntur.",
    image: "https://images.unsplash.com/photo-1588401344464-9f12dfce05d3?q=80&w=2070&auto=format&fit=crop",
    color: "from-red-700 via-red-600 to-orange-600"
  }
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
      {/* Dynamic Hero Section */}
      <div className="relative h-[600px] overflow-hidden bg-gray-900 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 bg-gradient-to-r ${HERO_SLIDES[currentSlide].color} overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6 }}
              src={HERO_SLIDES[currentSlide].image} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
              alt="Spices"
            />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-10"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center relative z-20 text-center pt-10">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold mb-6 backdrop-blur-md border border-white/20">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  {HERO_SLIDES[currentSlide].subtitle}
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 font-serif tracking-tight drop-shadow-lg">
                  {HERO_SLIDES[currentSlide].title.split(' ').map((word, i, arr) => 
                    i === arr.length - 1 ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-200">{word}</span> : word + ' '
                  )}
                </h1>
                <p className="text-xl text-orange-50 mb-10 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
                  {HERO_SLIDES[currentSlide].description}
                </p>
                
                <div className="max-w-xl mx-auto relative group/search">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-30">
                    <Search className="h-6 w-6 text-gray-400 group-focus-within/search:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for turmeric, garam masala, chili..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 rounded-full border-0 text-gray-900 bg-white/95 backdrop-blur-xl shadow-2xl focus:ring-4 focus:ring-orange-400/50 transition-all text-lg relative z-20"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {HERO_SLIDES.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
        
        <button 
          onClick={() => setCurrentSlide((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={() => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
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
