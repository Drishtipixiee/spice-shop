'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrder, Order } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Package, Truck, Check, Clock, XCircle, MapPin, Phone, User, ShoppingBag, Activity } from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderId = params.id as string;
        if (orderId) {
          const data = await getOrder(orderId);
          setOrder(data);
        }
      } catch (err: any) {
        setError('Could not fetch order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4 bg-orange-50/30">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4 bg-orange-50/30">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-orange-100 max-w-md w-full">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The order you're looking for doesn't exist."}</p>
            <button 
              onClick={() => router.push('/products')}
              className="bg-orange-500 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition-colors w-full flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4 mr-1.5" />;
      case 'confirmed': return <Check className="w-4 h-4 mr-1.5" />;
      case 'shipped': return <Truck className="w-4 h-4 mr-1.5" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 mr-1.5" />;
      case 'cancelled': return <XCircle className="w-4 h-4 mr-1.5" />;
      default: return <Activity className="w-4 h-4 mr-1.5" />;
    }
  };

  const scrollToTracking = () => {
    document.getElementById('order-tracking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-orange-50/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Success Header */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-sm border border-orange-100">
            <div className="mb-6 relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative flex items-center justify-center w-24 h-24 bg-green-500 rounded-full text-white">
                <CheckCircle className="w-12 h-12" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-500 text-lg mb-8">Thank you for your purchase.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => router.push('/products')}
                className="w-full sm:w-auto bg-orange-500 text-white px-8 py-3.5 rounded-full font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </button>
              <button 
                onClick={scrollToTracking}
                className="w-full sm:w-auto bg-white text-orange-600 border-2 border-orange-200 px-8 py-3.5 rounded-full font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" />
                Track Order
              </button>
            </div>
          </div>

          {/* WhatsApp Info */}
          {order.paymentMethod === 'whatsapp' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-green-500 text-white p-3 rounded-full shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-1">WhatsApp Order Confirmation</h3>
                <p className="text-green-700">We'll confirm your order on WhatsApp shortly. Please save our number to ensure you receive our messages: <strong className="whitespace-nowrap">+91 99999 99999</strong></p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Items List */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-100">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    Order Items
                  </h2>
                  <span className="text-gray-500 font-medium">#{order.id.slice(-8).toUpperCase()}</span>
                </div>
                
                <div className="space-y-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-20 h-20 bg-orange-50 rounded-xl overflow-hidden shrink-0 border border-orange-100">
                        <img 
                          src={item.productImage || 'https://via.placeholder.com/150'} 
                          alt={item.productName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-center">
                        <h4 className="font-bold text-gray-900 line-clamp-1">{item.productName}</h4>
                        <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{item.variantLabel}</span>
                          <span>Qty: <span className="font-semibold text-gray-700">{item.quantity}</span></span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                        <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge</span>
                    <span className="font-medium">₹{order.deliveryCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100 mt-3">
                    <span>Total</span>
                    <span className="text-orange-600">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              
              {/* Order Status */}
              <div id="order-tracking" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Order Status
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="relative pl-6 border-l-2 border-orange-100 space-y-8 mt-6">
                    <div className="relative">
                      <div className="absolute -left-[35px] top-0 w-6 h-6 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Order Placed</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {['confirmed', 'shipped', 'delivered'].includes(order.status.toLowerCase()) && (
                      <div className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Order Confirmed</p>
                        </div>
                      </div>
                    )}
                    
                    {['shipped', 'delivered'].includes(order.status.toLowerCase()) && (
                      <div className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Order Shipped</p>
                        </div>
                      </div>
                    )}
                    
                    {['delivered'].includes(order.status.toLowerCase()) && (
                      <div className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-green-700 text-sm">Delivered</p>
                        </div>
                      </div>
                    )}
                    
                    {order.status.toLowerCase() === 'cancelled' && (
                      <div className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 bg-red-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                          <XCircle className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-red-700 text-sm">Order Cancelled</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  Customer Details
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Name</p>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <p className="font-medium text-gray-900">{order.customerPhone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Delivery Address</p>
                      <p className="font-medium text-gray-900 leading-relaxed">
                        {order.deliveryAddress}<br/>
                        {order.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
