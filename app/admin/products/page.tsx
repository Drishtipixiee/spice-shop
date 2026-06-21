'use client';

import React, { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, Product, ProductVariant } from '@/lib/api';
import { Plus, Edit2, Trash2, Search, X, Check, Image as ImageIcon, PlusCircle, MinusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    category: '',
    description: '',
    imageUrl: '',
    isFeatured: false,
    variants: [{ weight: '', price: 0, mrp: 0, stock: 0, sku: '' }]
  });

  // Delete states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentProduct({
      name: '',
      slug: '',
      category: '',
      description: '',
      imageUrl: '',
      isFeatured: false,
      variants: [{ weight: '', price: 0, mrp: 0, stock: 0, sku: '' }]
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && currentProduct.id) {
        await updateAdminProduct(currentProduct.id, currentProduct);
        toast.success('Product updated successfully');
      } else {
        await createAdminProduct(currentProduct);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteAdminProduct(productToDelete);
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  // Variant handlers
  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...(currentProduct.variants || [])];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setCurrentProduct({ ...currentProduct, variants: updatedVariants });
  };

  const addVariantRow = () => {
    setCurrentProduct({
      ...currentProduct,
      variants: [...(currentProduct.variants || []), { weight: '', price: 0, mrp: 0, stock: 0, sku: '' }]
    });
  };

  const removeVariantRow = (index: number) => {
    const updatedVariants = [...(currentProduct.variants || [])];
    updatedVariants.splice(index, 1);
    setCurrentProduct({ ...currentProduct, variants: updatedVariants });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <button
            onClick={handleOpenAddModal}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            className="flex-grow bg-transparent border-none focus:outline-none text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Variants</th>
                  <th className="px-6 py-4 text-center">Featured</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-orange-300" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">/{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-900">
                        {product.variants?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.isFeatured ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400">
                            <MinusCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(product.id || null);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No products found. Add a new product to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                <form id="product-form" onSubmit={handleSaveProduct} className="space-y-8">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                      <input
                        required
                        type="text"
                        value={currentProduct.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setCurrentProduct({
                            ...currentProduct,
                            name,
                            slug: isEditMode ? currentProduct.slug : generateSlug(name)
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
                        placeholder="e.g. Premium Saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Slug *</label>
                      <input
                        required
                        type="text"
                        value={currentProduct.slug}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, slug: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
                        placeholder="e.g. premium-saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                      <select
                        required
                        value={currentProduct.category}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
                      >
                        <option value="">Select Category</option>
                        <option value="Spices">Spices</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Dry Fruits">Dry Fruits</option>
                        <option value="Herbs">Herbs</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL *</label>
                      <input
                        required
                        type="url"
                        value={currentProduct.imageUrl}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                      <textarea
                        required
                        rows={4}
                        value={currentProduct.description}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
                        placeholder="Detailed product description..."
                      ></textarea>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={currentProduct.isFeatured || false}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, isFeatured: e.target.checked })}
                          className="w-5 h-5 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">Featured Product</span>
                          <span className="text-sm text-gray-500">Show this product on the homepage</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Variants Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
                      <button
                        type="button"
                        onClick={addVariantRow}
                        className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Variant
                      </button>
                    </div>

                    <div className="space-y-4">
                      {currentProduct.variants?.map((variant, index) => (
                        <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-start p-4 bg-gray-50 border border-gray-200 rounded-xl relative">
                          <div className="w-full md:w-1/5">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Weight Label *</label>
                            <input
                              required
                              type="text"
                              value={variant.weight}
                              onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                              placeholder="e.g. 100g, 1kg"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div className="w-1/2 md:w-1/6">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                            <input
                              required
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div className="w-1/2 md:w-1/6">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">MRP (₹) *</label>
                            <input
                              required
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.mrp}
                              onChange={(e) => handleVariantChange(index, 'mrp', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div className="w-1/2 md:w-1/6">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Qty *</label>
                            <input
                              required
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div className="w-1/2 md:w-1/5">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">SKU</label>
                            <input
                              type="text"
                              value={variant.sku || ''}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                              placeholder="Optional"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          {currentProduct.variants!.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariantRow(index)}
                              className="absolute -right-2 -top-2 bg-white text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 shadow-sm border border-gray-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="product-form"
                  className="px-6 py-2.5 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {isEditMode ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
