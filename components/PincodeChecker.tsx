'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { validatePincode, type PincodeResult } from '@/lib/api';

interface PincodeCheckerProps {
  onResult: (result: PincodeResult) => void;
  initialPincode?: string;
}

export default function PincodeChecker({ onResult, initialPincode }: PincodeCheckerProps) {
  const [pincode, setPincode] = useState(initialPincode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPincode && initialPincode.length === 6) {
      handleCheck(initialPincode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isValidPincode(value: string): boolean {
    return /^\d{6}$/.test(value);
  }

  async function handleCheck(pincodeValue?: string) {
    const code = pincodeValue || pincode;

    if (!isValidPincode(code)) {
      setError('Please enter a valid 6-digit pincode');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await validatePincode(code);
      setResult(res);
      onResult(res);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to check pincode. Please try again.';
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);

    if (value.length < 6) {
      setResult(null);
      setError(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleCheck();
    }
  }

  function handleBlur() {
    if (pincode.length === 6 && !result) {
      handleCheck();
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        <MapPin className="w-4 h-4 inline mr-1 text-saffron-500" />
        Check Delivery Availability
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          maxLength={6}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-all placeholder-gray-400"
        />
        <button
          onClick={() => handleCheck()}
          disabled={loading || pincode.length !== 6}
          className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm btn-press flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking</span>
            </>
          ) : (
            'Check'
          )}
        </button>
      </div>

      {/* Result Banner */}
      {result && (
        <div
          className={`mt-3 p-3 rounded-lg flex items-start gap-2 animate-fade-in ${
            result.deliverable
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {result.deliverable ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-sm">
            {result.deliverable ? (
              <>
                <p className="font-medium">
                  Delivery available to {result.zone}!
                </p>
                <p className="text-green-600 text-xs mt-0.5">
                  {result.delivery_charge === 0
                    ? 'Free delivery'
                    : `Delivery charge: ₹${result.delivery_charge}`}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">Not serviceable</p>
                <p className="text-red-600 text-xs mt-0.5">{result.message}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Client-side Validation Error */}
      {error && !result && (
        <p className="mt-2 text-sm text-red-600 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
