'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, PackageOpen } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getCategories, getProducts } from '@/lib/api';
import type { Category, Product } from '@/lib/api';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [catData, prodData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        setCategories(catData);
        setProducts(prodData);
      } catch {
        console.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleCategory = useCallback((slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name?.toLowerCase().includes(q);
        const matchDesc = product.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const productCategory =
          product.category?.slug || product.category_slug || '';
        if (!selectedCategories.includes(productCategory)) return false;
      }

      // Price filter (based on first variant)
      const price =
        product.variants?.[0]?.price_inr ?? product.price_inr ?? 0;
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategories, minPrice, maxPrice]);

  const hasActiveFilters =
    selectedCategories.length > 0 || minPrice || maxPrice || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#FF8C00] to-[#FF6B35] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Products</h1>
          <p className="text-orange-100 text-lg">
            Discover our premium range of spices and dairy products
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search bar */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm text-gray-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 text-gray-700 font-medium shadow-sm"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'
            } md:block md:relative md:bg-transparent md:p-0 md:z-auto w-full md:w-64 md:min-w-[16rem] flex-shrink-0`}
          >
            {/* Mobile filter header */}
            <div className="flex items-center justify-between mb-6 md:hidden">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:sticky md:top-24 shadow-sm">
              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <label
                      key={cat.id || cat.slug}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.slug)}
                        onChange={() => toggleCategory(cat.slug)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                      />
                      <span className="text-gray-700 group-hover:text-orange-600 transition-colors flex-1">
                        {cat.name}
                      </span>
                      {cat.product_count !== undefined && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {cat.product_count}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Price Range
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
                    />
                  </div>
                  <span className="text-gray-400">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Quick price ranges */}
              <div className="mb-6">
                <div className="space-y-2">
                  {[
                    { label: 'Under ₹100', min: '', max: '100' },
                    { label: '₹100 - ₹300', min: '100', max: '300' },
                    { label: '₹300 - ₹500', min: '300', max: '500' },
                    { label: 'Above ₹500', min: '500', max: '' },
                  ].map((range) => (
                    <button
                      key={range.label}
                      onClick={() => {
                        setMinPrice(range.min);
                        setMaxPrice(range.max);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        minPrice === range.min && maxPrice === range.max
                          ? 'bg-orange-100 text-orange-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 text-sm font-semibold text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Clear All Filters
                </button>
              )}

              {/* Mobile apply button */}
              <button
                onClick={() => setShowFilters(false)}
                className="mt-4 w-full py-3 bg-orange-500 text-white font-semibold rounded-xl md:hidden hover:bg-orange-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((slug) => {
                  const cat = categories.find((c) => c.slug === slug);
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full"
                    >
                      {cat?.name || slug}
                      <button onClick={() => toggleCategory(slug)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full">
                    ₹{minPrice || '0'} – ₹{maxPrice || '∞'}
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-gray-500 mb-4">
              {loading
                ? 'Loading products...'
                : `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id || product.slug} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
