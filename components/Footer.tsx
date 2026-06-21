'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white mb-4">
              <span className="text-2xl">🌶️</span>
              <span>Pure Spice & Dairy</span>
            </Link>
            <p className="text-saffron-400 font-semibold text-sm mb-3">
              Pure. Fresh. Trusted.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bringing the finest Indian spices and fresh dairy products directly from farms
              to your doorstep. Quality you can taste, purity you can trust.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-saffron-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-saffron-400 transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-saffron-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-saffron-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-saffron-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-400 hover:text-saffron-400 transition-colors text-sm">
                  Refund &amp; Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">📞</span>
                <a
                  href="tel:+919999999999"
                  className="text-gray-400 hover:text-saffron-400 transition-colors"
                >
                  +91 99999 99999
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">📧</span>
                <a
                  href="mailto:hello@spiceshop.in"
                  className="text-gray-400 hover:text-saffron-400 transition-colors"
                >
                  hello@spiceshop.in
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">💬</span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: FSSAI */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Certifications</h3>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm font-medium text-white mb-2">
                🏛️ FSSAI Licensed
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Lic. No.: XXXXXXXXXXXXXX
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                All our products are manufactured and packaged in compliance with FSSAI
                food safety standards. Your health and safety is our priority.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span className="text-xs text-gray-500 mr-2">Accepted Payments:</span>
            <span className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-medium border border-gray-700">
              Razorpay
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-medium border border-gray-700">
              UPI
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-medium border border-gray-700">
              Visa
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-medium border border-gray-700">
              Mastercard
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-medium border border-gray-700">
              Net Banking
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-gray-500">
            © {currentYear} Pure Spice &amp; Dairy. All Rights Reserved. | Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}
