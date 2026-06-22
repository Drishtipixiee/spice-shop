'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingBag, Droplet, Flame, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const SPICES = [
  { id: 'turmeric', name: 'Turmeric', color: 'bg-yellow-400', emoji: '🌟', heat: 0, earthiness: 5 },
  { id: 'chilli', name: 'Red Chilli', color: 'bg-red-500', emoji: '🌶️', heat: 5, earthiness: 2 },
  { id: 'cumin', name: 'Cumin', color: 'bg-amber-700', emoji: '🌰', heat: 1, earthiness: 5 },
  { id: 'coriander', name: 'Coriander', color: 'bg-orange-300', emoji: '🌿', heat: 0, earthiness: 4 },
  { id: 'black-pepper', name: 'Black Pepper', color: 'bg-gray-800', emoji: '⚫', heat: 4, earthiness: 3 },
];

export default function Blender() {
  const [blend, setBlend] = useState<Record<string, number>>({});
  const { addToCart } = useCartStore();

  const addSpice = (id: string) => {
    setBlend(prev => ({
      ...prev,
      [id]: Math.min((prev[id] || 0) + 1, 5) // Max 5 scoops per spice
    }));
  };

  const removeSpice = (id: string) => {
    setBlend(prev => {
      const newBlend = { ...prev };
      if (newBlend[id] > 0) newBlend[id]--;
      if (newBlend[id] === 0) delete newBlend[id];
      return newBlend;
    });
  };

  // Calculate profile
  let totalHeat = 0;
  let totalEarth = 0;
  let totalScoops = 0;

  Object.entries(blend).forEach(([id, scoops]) => {
    const spice = SPICES.find(s => s.id === id)!;
    totalHeat += spice.heat * scoops;
    totalEarth += spice.earthiness * scoops;
    totalScoops += scoops;
  });

  const avgHeat = totalScoops > 0 ? (totalHeat / (totalScoops * 5)) * 100 : 0;
  const avgEarth = totalScoops > 0 ? (totalEarth / (totalScoops * 5)) * 100 : 0;

  const handleCreateBlend = () => {
    if (totalScoops === 0) return toast.error('Add some spices first!');
    
    addToCart({
      id: 'custom_blend_' + Date.now().toString(),
      name: `Custom Spice Blend (${totalScoops * 50}g)`,
      description: "Custom blend created in Spice Blender",
      price: totalScoops * 40, // ₹40 per scoop
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Indian_Spices.jpg',
      category: 'Blends',
      stock: 100,
      is_featured: false
    });
    toast.success('Custom blend added to cart!');
    setBlend({});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-orange-600/20 to-red-600/20 blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              The Spice Blender
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Create your own signature masala blend.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Ingredients Picker */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="text-amber-400" /> Choose Ingredients
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPICES.map(spice => (
                <div key={spice.id} className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold flex items-center gap-2">
                      <span className="text-2xl">{spice.emoji}</span> {spice.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 rounded-full p-1">
                    <button onClick={() => removeSpice(spice.id)} className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold flex items-center justify-center transition-colors">-</button>
                    <span className="font-mono font-bold text-lg">{blend[spice.id] || 0}</span>
                    <button onClick={() => addSpice(spice.id)} className="w-10 h-10 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-400 font-bold flex items-center justify-center transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mixing Bowl & Profile */}
          <div className="flex flex-col items-center">
            {/* The Bowl */}
            <div className="relative w-80 h-80 mb-12">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full shadow-[inset_0_-20px_50px_rgba(0,0,0,0.8)] border-8 border-gray-700 overflow-hidden flex items-end justify-center pb-8">
                <AnimatePresence>
                  {totalScoops === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 mb-20 text-lg font-bold">
                      Add Spices to Bowl
                    </motion.div>
                  ) : (
                    <div className="w-full flex gap-1 px-8 justify-center items-end h-full">
                      {Object.entries(blend).map(([id, scoops]) => {
                        const spice = SPICES.find(s => s.id === id)!;
                        return Array.from({ length: scoops }).map((_, i) => (
                          <motion.div
                            key={`${id}-${i}`}
                            initial={{ y: -200, opacity: 0, rotate: Math.random() * 360 }}
                            animate={{ y: 0, opacity: 1, rotate: Math.random() * 360 }}
                            className={`w-4 h-12 rounded-full ${spice.color} shadow-lg origin-bottom`}
                            style={{ transformOrigin: 'bottom center', rotate: `${(Math.random() - 0.5) * 60}deg` }}
                          />
                        ));
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-8 bg-black/50 blur-xl rounded-full" />
            </div>

            {/* Flavor Profile */}
            <div className="w-full bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold mb-6 text-center">Flavor Profile</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2 text-gray-300">
                    <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-red-400" /> Heat Level</span>
                    <span>{Math.round(avgHeat)}%</span>
                  </div>
                  <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${avgHeat}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 text-gray-300">
                    <span className="flex items-center gap-1"><Droplet className="w-4 h-4 text-amber-600" /> Earthiness</span>
                    <span>{Math.round(avgEarth)}%</span>
                  </div>
                  <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-700"
                      initial={{ width: 0 }}
                      animate={{ width: `${avgEarth}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Weight</p>
                  <p className="text-2xl font-bold">{totalScoops * 50}g</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="text-2xl font-bold text-green-400">₹{totalScoops * 40}</p>
                </div>
              </div>

              <button
                onClick={handleCreateBlend}
                disabled={totalScoops === 0}
                className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" /> Add Blend to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
