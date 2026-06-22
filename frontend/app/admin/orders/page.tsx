'use client';

import React, { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { getAdminOrders, updateOrderStatus, Order } from '@/lib/api';
import { ChevronDown, ChevronUp, Search, Filter, MapPin, Phone, User, Package, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      // Optimistically update
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleRow = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const statuses = ['All', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and Search logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status.toLowerCase() === filterStatus.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.customerPhone.includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative flex items-center">
            <Search className="w-5 h-5 text-gray-400 absolute left-4" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Phone..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === status 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4 w-10"></th>
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </td>
                  </tr>
                ) : currentOrders.length > 0 ? (
                  currentOrders.map((order) => {
                    const isExpanded = expandedRows.has(order.id);
                    return (
                      <React.Fragment key={order.id}>
                        <tr 
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-orange-50/20' : ''}`}
                          onClick={() => toggleRow(order.id)}
                        >
                          <td className="px-6 py-4">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-xs text-gray-500">{order.customerPhone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">₹{order.total.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{order.items.length} item(s)</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${
                              order.paymentMethod === 'razorpay' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-green-50 text-green-700 border border-green-100'
                            }`}>
                              {order.paymentMethod === 'razorpay' ? 'Prepaid (Razorpay)' : 'WhatsApp COD'}
                            </span>
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${getStatusColor(order.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                        
                        {/* Expanded Details Row */}
                        {isExpanded && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={6} className="px-6 py-6 border-b border-gray-100">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Order Items */}
                                <div>
                                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <Package className="w-4 h-4 text-orange-500" />
                                    Order Items
                                  </h4>
                                  <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
                                        <img 
                                          src={item.productImage || 'https://via.placeholder.com/50'} 
                                          alt={item.productName} 
                                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-100"
                                        />
                                        <div className="flex-grow">
                                          <p className="font-semibold text-gray-900 text-sm line-clamp-1">{item.productName}</p>
                                          <p className="text-xs text-gray-500">{item.variantLabel} × {item.quantity}</p>
                                        </div>
                                        <div className="text-right font-bold text-gray-900 text-sm">
                                          ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4 pt-3 border-t border-gray-200 text-sm flex flex-col gap-1 text-right">
                                    <p className="text-gray-500">Subtotal: ₹{order.subtotal.toFixed(2)}</p>
                                    <p className="text-gray-500">Delivery: ₹{order.deliveryCharge.toFixed(2)}</p>
                                    <p className="font-bold text-lg text-gray-900 mt-1">Total: ₹{order.total.toFixed(2)}</p>
                                  </div>
                                </div>

                                {/* Customer Info */}
                                <div>
                                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <User className="w-4 h-4 text-orange-500" />
                                    Customer & Delivery Details
                                  </h4>
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                                    <div className="flex items-start gap-3">
                                      <User className="w-5 h-5 text-gray-400 shrink-0" />
                                      <div>
                                        <p className="text-xs text-gray-500 font-medium">Name</p>
                                        <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                                      <div>
                                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                                        <p className="text-sm font-semibold text-gray-900">{order.customerPhone}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                                      <div>
                                        <p className="text-xs text-gray-500 font-medium">Address</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                                          {order.deliveryAddress}<br/>
                                          Pincode: {order.pincode}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No orders found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  Prev
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminGuard>
  );
}
