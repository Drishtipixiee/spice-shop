'use client';

import React, { useCallback } from 'react';
import { CreditCard, Clock } from 'lucide-react';

interface RazorpayButtonProps {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (error: unknown) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayButton({
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
}: RazorpayButtonProps) {
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_RAZORPAY === 'true';
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

  const handlePayment = useCallback(async () => {
    if (!isEnabled || !keyId) {
      onFailure(new Error('Razorpay is not configured'));
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onFailure(new Error('Failed to load Razorpay SDK'));
      return;
    }

    const options: RazorpayOptions = {
      key: keyId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'Pure Spice & Dairy',
      description: `Order #${orderId}`,
      order_id: orderId,
      handler: (response) => {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      theme: {
        color: '#F97316',
      },
      modal: {
        ondismiss: () => {
          onFailure(new Error('Payment cancelled by user'));
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: unknown) => {
        onFailure(response);
      });
      razorpay.open();
    } catch (err) {
      onFailure(err);
    }
  }, [isEnabled, keyId, amount, orderId, customerName, customerEmail, customerPhone, onSuccess, onFailure]);

  if (!isEnabled) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-gray-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <span>Coming Soon</span>
          </div>

          <h3 className="text-lg font-bold text-gray-700 mb-2">
            Online Payment
          </h3>

          <p className="text-gray-500 text-sm max-w-sm">
            Online payment will be available soon. For now, please use WhatsApp
            ordering or Cash on Delivery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
          <CreditCard className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-lg font-bold text-blue-800 mb-2">
          Pay Online
        </h3>

        <p className="text-blue-700 text-sm mb-6 max-w-sm">
          Secure payment via Razorpay. Pay using UPI, cards, net banking, or wallets.
        </p>

        <button
          onClick={handlePayment}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 btn-press flex items-center justify-center gap-2 shadow-md shadow-blue-200"
        >
          <CreditCard className="w-5 h-5" />
          Pay ₹{amount.toFixed(0)} Now
        </button>

        <p className="text-xs text-blue-600 mt-3">
          Powered by Razorpay · 100% Secure
        </p>
      </div>
    </div>
  );
}
