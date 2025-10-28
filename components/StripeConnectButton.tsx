'use client';

import { useState, useEffect } from 'react';

interface StripeConnectButtonProps {
  userId: string;
  onConnected?: () => void;
}

export default function StripeConnectButton({ userId, onConnected }: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkConnectStatus();
  }, [userId]);

  const checkConnectStatus = async () => {
    try {
      const response = await fetch(`/api/stripe/connect?user_id=${userId}`);
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error('Error checking Connect status:', err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe onboarding
        window.location.href = data.data.url;
      } else {
        setError(data.error || 'Failed to create Connect account');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  if (status?.onboarding_complete) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Stripe Connected</h3>
            <p className="text-sm text-green-700">You're ready to receive payments</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">
            Connect Stripe to Receive Payments
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            To receive payments from bookings, you need to connect your Stripe account.
            This is a secure process that takes just a few minutes.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Connecting...' : 'Connect with Stripe'}
          </button>

          <p className="text-xs text-blue-700 mt-3">
            You'll be redirected to Stripe to complete the setup process
          </p>
        </div>
      </div>
    </div>
  );
}
