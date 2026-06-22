'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from './CartDrawer';
import { getCategories, type Category } from '@/lib/api';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-saffron-600 via-spice-500 to-saffron-600 text-white text-center text-xs sm:text-sm py-2 px-4">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span>🚚 Free delivery on orders above ₹499</span>
          <span className="hidden sm:inline">|</span>
          <span>📞 Order via WhatsApp</span>
        </span>
      </div>

      {/* Main Navbar */}
      <nav
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
          isScrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-saffron-700 hover:text-saffron-600 transition-colors flex-shrink-0"
            >
              <span className="text-2xl">🌶️</span>
              <span className="hidden sm:inline">Pure Spice & Dairy</span>
              <span className="sm:hidden">Pure Spice</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-saffron-600 font-medium transition-colors"
              >
                Home
              </Link>

              {/* Products Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center gap-1 text-gray-700 hover:text-saffron-600 font-medium transition-colors"
                >
                  Products
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isCategoriesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                    <Link
                      href="/products"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-saffron-50 hover:text-saffron-700 font-medium transition-colors"
                    >
                      All Products
                    </Link>
                    {categories.length > 0 && (
                      <div className="border-t border-gray-100 my-1" />
                    )}
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-saffron-50 hover:text-saffron-700 transition-colors"
                      >
                        {category.name}
                        {category.product_count !== undefined && (
                          <span className="ml-2 text-xs text-gray-400">
                            ({category.product_count})
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/about"
                className="text-gray-700 hover:text-saffron-600 font-medium transition-colors"
              >
                About
              </Link>
            </div>

            {/* Right Side: Cart + Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-saffron-600 transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-saffron-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-scale-in">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-saffron-600 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Slide-in Menu */}
            <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl animate-slide-in-right md:hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-bold text-saffron-700"
                >
                  🌶️ Pure Spice & Dairy
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-6 py-3 text-gray-700 hover:bg-saffron-50 hover:text-saffron-700 font-medium transition-colors"
                >
                  Home
                </Link>

                <Link
                  href="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-6 py-3 text-gray-700 hover:bg-saffron-50 hover:text-saffron-700 font-medium transition-colors"
                >
                  All Products
                </Link>

                {categories.length > 0 && (
                  <div className="px-6 py-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Categories
                    </p>
                  </div>
                )}

                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-8 py-2.5 text-sm text-gray-600 hover:bg-saffron-50 hover:text-saffron-700 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}

                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-6 py-3 text-gray-700 hover:bg-saffron-50 hover:text-saffron-700 font-medium transition-colors"
                >
                  About
                </Link>

                <div className="border-t border-gray-100 mt-4 pt-4">
                  <Link
                    href="/cart"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-6 py-3 text-gray-700 hover:bg-saffron-50 hover:text-saffron-700 font-medium transition-colors"
                  >
                    🛒 Cart {itemCount > 0 && `(${itemCount})`}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
