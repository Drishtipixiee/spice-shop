'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PincodeChecker from '@/components/PincodeChecker';
import WhatsAppCheckout from '@/components/WhatsAppCheckout';
import RazorpayButton from '@/components/RazorpayButton';
import { useCartStore } from '@/store/cartStore';
import { createOrder } from '@/lib/api';
import type { PincodeResult } from '@/lib/api';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
  'Puducherry', 'Dadra & Nagar Haveli', 'Lakshadweep',
  'Andaman & Nicobar Islands',
];

interface FormData {
  fullName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface FormErrors {
  fullName?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDeliveryCharge = useCartStore((s) => s.getDeliveryCharge);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = useMemo(() => getSubtotal(), [items, getSubtotal]);
  const delivery = useMemo(() => getDeliveryCharge(), [items, getDeliveryCharge]);
  const total = useMemo(() => getTotal(), [items, getTotal]);

  const [form, setForm] = useState<FormData>({
    fullName: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [pincodeDeliverable, setPincodeDeliverable] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'online'>('whatsapp');
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePincodeResult = (result: PincodeResult) => {
    setPincodeVerified(true);
    setPincodeDeliverable(result.deliverable);
    if (result.deliverable) {
      setForm((prev) => ({
        ...prev,
        pincode: result.pincode || prev.pincode,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!form.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number starting with 6-9';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!form.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!form.state) {
      newErrors.state = 'State is required';
    }

    if (!form.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWhatsAppOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    if (!pincodeDeliverable) {
      toast.error('Please enter a deliverable pincode');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        customer_name: form.fullName,
        customer_phone: form.mobile,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        payment_method: 'whatsapp',
        items: items.map((item) => ({
          product_id: item.id,
          variant_id: item.id,
          quantity: item.quantity,
          price: item.price,
          unit_price: item.price,
          name: item.name,
          variant_label: "",
        })),
        subtotal,
        delivery_charge: delivery,
        total,
      };

      const result = await createOrder(orderData);

      if (result.whatsapp_url) {
        window.open(result.whatsapp_url, '_blank');
      }

      clearCart();
      toast.success('Order placed successfully!');

      const orderId = (result as any).order_id || (result as any).id;
      router.push(`/orders/${orderId}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products before checking out.</p>
          <a
            href="/products"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Delivery Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Delivery Details</h2>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full pl-14 pr-4 py-3 rounded-xl border ${
                        errors.mobile ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800`}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="House/Flat no., Building, Street, Landmark"
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 resize-none`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.state ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 bg-white`}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <PincodeChecker
                    value={form.pincode}
                    onChange={(val: string) => {
                      setForm((prev) => ({ ...prev, pincode: val }));
                      setPincodeVerified(false);
                      setPincodeDeliverable(false);
                    }}
                    onResult={handlePincodeResult}
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
                  )}
                  {pincodeVerified && !pincodeDeliverable && (
                    <p className="text-red-500 text-xs mt-1">
                      Sorry, we don&apos;t deliver to this pincode yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Method</h2>

              {/* Tabs */}
              <div className="flex border border-gray-200 rounded-xl overflow-hidden mb-6">
                <button
                  onClick={() => setActiveTab('whatsapp')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-colors ${
                    activeTab === 'whatsapp'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Order
                </button>
                <button
                  onClick={() => setActiveTab('online')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-colors ${
                    activeTab === 'online'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Pay Online
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'whatsapp' ? (
                <div>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                    <p className="text-sm text-green-800">
                      <strong>How it works:</strong> Your order details will be sent to us via WhatsApp.
                      We&apos;ll confirm your order and arrange delivery. Pay on delivery (COD).
                    </p>
                  </div>
                  <WhatsAppCheckout
                    disabled={!pincodeDeliverable || submitting}
                    onSubmit={handleWhatsAppOrder}
                  />
                  {submitting && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-orange-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Placing your order...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <RazorpayButton
                    orderId=""
                    amount={total}
                    customerName={form.fullName}
                    customerEmail=""
                    customerPhone={form.mobile}
                    onSuccess={(data) => { console.log('success', data); }}
                    onFailure={(err) => { console.log('error', err); }}
                  />
                </div>
              )}

              {!pincodeDeliverable && (
                <p className="text-xs text-amber-600 mt-4 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Please verify your pincode above to proceed with checkout.
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => {
                  const itemId = (item as any).variantId || item.id || `${(item as any).productId}-${item.variant}`;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                        🌶️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-gray-500 text-xs">
                          {item.variant} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 flex-shrink-0">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  {delivery === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span className="font-medium">₹{delivery}</span>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-orange-600">₹{total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
