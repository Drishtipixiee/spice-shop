'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Mail, Shield, Leaf, Truck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import { getCategories, getProducts } from '@/lib/api';
import type { Category, Product } from '@/lib/api';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [catData, prodData] = await Promise.all([
          getCategories(),
          getProducts({ featured: true }),
        ]);
        setCategories(catData);
        setFeaturedProducts(prodData);
      } catch {
        console.error('Failed to fetch homepage data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('🎉 Subscribed! Check your inbox for exclusive offers.');
    setEmail('');
  };

  const categoryIcons: Record<string, string> = {
    spices: '🌶️',
    dairy: '🥛',
    combos: '🎁',
    combo: '🎁',
  };

  const categoryDescriptions: Record<string, string> = {
    spices: 'Premium quality spices sourced directly from Indian farms',
    dairy: 'Fresh dairy products delivered straight to your doorstep',
    combos: 'Specially curated combo packs at great value',
    combo: 'Specially curated combo packs at great value',
  };

  const getCategoryIcon = (name: string) => {
    const key = name.toLowerCase().replace(/\s+/g, '');
    for (const [k, v] of Object.entries(categoryIcons)) {
      if (key.includes(k)) return v;
    }
    return '🛒';
  };

  const getCategoryDescription = (name: string) => {
    const key = name.toLowerCase().replace(/\s+/g, '');
    for (const [k, v] of Object.entries(categoryDescriptions)) {
      if (key.includes(k)) return v;
    }
    return 'Explore our curated selection of premium products';
  };

  const testimonials = [
    {
      quote: "The turmeric powder is the best I've ever used. So fresh and aromatic!",
      name: 'Priya Sharma',
      location: 'Mumbai',
      rating: 5,
    },
    {
      quote: "Their ghee reminds me of my grandmother's homemade ghee. Pure and delicious!",
      name: 'Rajesh Kumar',
      location: 'Dadar',
      rating: 5,
    },
    {
      quote: 'Fast delivery and excellent quality spices. My go-to store now!',
      name: 'Anita Desai',
      location: 'Colaba',
      rating: 5,
    },
  ];

  return (
    <div className="w-full bg-[#FAFAFA] selection:bg-orange-500 selection:text-white">
      {/* ====== ULTRA PREMIUM HERO SECTION ====== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Dynamic Abstract Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-orange-600/40 to-amber-400/20 blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-red-600/30 to-orange-500/20 blur-[100px] mix-blend-screen animate-pulse delay-700" />
          <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-gradient-to-b from-yellow-400/20 to-transparent blur-[80px] mix-blend-screen" />
        </div>
        
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/3/35/Indian_Spices.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay grayscale-[30%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-300 text-xs font-semibold tracking-wider uppercase mb-6 shadow-2xl animate-fade-slide-up">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            100% Authentic Indian Heritage
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-orange-200 leading-[1.2] tracking-tight mb-4 drop-shadow-2xl animate-fade-in">
            The Soul of <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Indian Cooking.</span>
          </h1>
          
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg">
            Experience the rich, authentic flavors of India with our farm-sourced spices and pure bilona-churned dairy essentials. Delivered fresh to your kitchen.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/blender"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-base font-bold shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_forwards]" />
              <span className="text-xl">✨</span> Custom Blender
            </Link>

            <Link
              href="/products?category=spices"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-base font-bold shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_forwards]" />
              <span className="text-xl">🌶️</span> Explore Spices
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/products?category=dairy"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/20 text-white rounded-xl text-base font-bold hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 shadow-xl"
            >
              <span className="text-xl">🥛</span> Pure Dairy
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Decorative Wave Divider */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.5,189.36,108.9Z" fill="#FAFAFA"></path>
          </svg>
        </div>
      </section>

      {/* ====== TRUST STRIP GLASSMORPHISM ====== */}
      <section className="relative z-20 -mt-8 max-w-6xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-gray-100">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-1">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-800">FSSAI Certified</span>
              <span className="text-xs text-gray-500">100% Quality Assured</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-1">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-800">100% Natural</span>
              <span className="text-xs text-gray-500">No Preservatives</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-1">
                <Truck className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-800">Fast Delivery</span>
              <span className="text-xs text-gray-500">Free above ₹499</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-800">Secure Payments</span>
              <span className="text-xs text-gray-500">256-bit Encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CATEGORY BENTO GRID ====== */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Curated Collections
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-3xl h-[400px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0,3).map((cat, index) => (
              <Link
                key={cat.id || cat.slug}
                href={`/products?category=${cat.slug}`}
                className={`group relative overflow-hidden rounded-[1.5rem] bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`p-8 ${index === 0 ? 'h-[350px]' : 'h-[300px]'} flex flex-col justify-between relative z-10`}>
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                      {getCategoryIcon(cat.name)}
                    </div>
                    <div className="bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-full text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                  
                  <div>
                    {cat.product_count !== undefined && (
                      <p className="text-orange-500 font-bold text-xs tracking-widest uppercase mb-2">
                        {cat.product_count} Products
                      </p>
                    )}
                    <h3 className={`${index === 0 ? 'text-4xl' : 'text-2xl'} font-black text-gray-900 mb-3 tracking-tight group-hover:text-orange-600 transition-colors`}>
                      {cat.name}
                    </h3>
                    <p className="text-gray-500 text-base">
                      {getCategoryDescription(cat.name)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ====== FEATURED PRODUCTS GALLERY ====== */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                Signature Items
              </h2>
              <p className="text-xl text-gray-400 max-w-xl">
                The absolute finest selections from our store, crafted for perfection.
              </p>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-bold transition-all backdrop-blur-md"
            >
              View Full Menu <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 rounded-3xl h-96 animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="transform hover:-translate-y-2 transition-transform duration-500">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">
              Featured products coming soon!
            </p>
          )}
        </div>
      </section>

      {/* ====== PREMIUM HOW IT WORKS ====== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              The Journey to Your Kitchen
            </h2>
            <div className="w-24 h-1 bg-gray-200 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
            
            {[
              {
                icon: '🌾',
                title: 'Farm Sourced',
                desc: 'We procure directly from the finest local farms to ensure absolute purity.',
                step: '01',
              },
              {
                icon: '🏺',
                title: 'Traditional Processing',
                desc: 'Stone-ground spices and bilona-churned dairy retain maximum nutrients.',
                step: '02',
              },
              {
                icon: '🚀',
                title: 'Express Delivery',
                desc: 'Packed securely and shipped immediately to preserve freshness.',
                step: '03',
              },
            ].map((item) => (
              <div key={item.step} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white border border-gray-100 shadow-[0_20px_50px_rgb(0,0,0,0.05)] rounded-3xl flex items-center justify-center mb-8 transform group-hover:rotate-12 transition-transform duration-500">
                  <span className="text-4xl">{item.icon}</span>
                </div>
                <div className="text-orange-500 font-black text-xl mb-4 opacity-50 tracking-widest">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-lg leading-relaxed max-w-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS WITH GLASS CARDS ====== */}
      <section className="py-24 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Green_Cardamom_pods.jpg/800px-Green_Cardamom_pods.jpg')] bg-cover bg-fixed bg-center relative">
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Loved by Thousands
            </h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-10 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 shadow-2xl"
              >
                <div className="flex mb-6 gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                  ))}
                </div>
                <p className="text-gray-200 text-lg italic mb-8 leading-relaxed font-medium">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/30">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{t.name}</p>
                    <p className="text-orange-300">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== STUNNING NEWSLETTER ====== */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-[3rem] p-12 md:p-20 shadow-[0_30px_60px_rgba(0,0,0,0.2)] text-center relative overflow-hidden border border-gray-800">
            {/* Inner glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <Mail className="w-16 h-16 text-orange-400 mx-auto mb-8 drop-shadow-lg" />
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 relative z-10">
              Join the Spice Club
            </h2>
            <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto relative z-10">
              Get 10% off your first order, plus exclusive access to limited edition seasonal spices and dairy batches.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto relative z-10">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-8 py-5 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white/10 transition-all text-lg backdrop-blur-md"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-5 rounded-full font-bold text-lg hover:from-orange-400 hover:to-red-400 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] whitespace-nowrap transform hover:scale-105"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
