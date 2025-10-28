'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spaceId = searchParams.get('space_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const [space, setSpace] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (!spaceId || !startDate || !endDate) {
      setError('Missing required booking information');
      setLoading(false);
      return;
    }

    fetchSpaceAndCreateBooking();
  }, [spaceId, startDate, endDate]);

  const fetchSpaceAndCreateBooking = async () => {
    try {
      // Get current user (you'll need to implement this based on your auth)
      const userResponse = await fetch('/api/auth/user');
      const userData = await userResponse.json();

      if (!userData.success || !userData.data) {
        router.push('/login?redirect=/checkout');
        return;
      }

      const userId = userData.data.id;

      // Fetch space details
      const spaceResponse = await fetch(`/api/spaces/${spaceId}`);
      const spaceData = await spaceResponse.json();

      if (!spaceData.success) {
        setError('Space not found');
        setLoading(false);
        return;
      }

      setSpace(spaceData.data);

      // Create booking and payment intent
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          space_id: spaceId,
          vendor_id: userId,
          start_date: startDate,
          end_date: endDate,
          special_requests: specialRequests,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingData.success) {
        setError(bookingData.error || 'Failed to create booking');
        setLoading(false);
        return;
      }

      setClientSecret(bookingData.data.clientSecret);
      setBookingDetails(bookingData.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link href="/spaces" className="text-primary-600 hover:underline">
            Back to Spaces
          </Link>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0F766E',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            GoLocal Spaces
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Booking Summary</h2>

            {space && (
              <>
                <div className="mb-6">
                  {space.space_images?.[0]?.image_url && (
                    <img
                      src={space.space_images[0].image_url}
                      alt={space.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{space.title}</h3>
                  <p className="text-gray-600">
                    {space.address}, {space.city}, {space.state}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-semibold">
                      {new Date(startDate!).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-semibold">
                      {new Date(endDate!).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {Math.ceil(
                        (new Date(endDate!).getTime() - new Date(startDate!).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </span>
                  </div>
                </div>

                {bookingDetails && (
                  <div className="border-t border-gray-200 mt-4 pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rental Fee:</span>
                      <span className="font-semibold">
                        ${bookingDetails.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee (10%):</span>
                      <span className="font-semibold">
                        ${bookingDetails.platformFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                      <span>Total:</span>
                      <span className="text-primary-600">
                        ${bookingDetails.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any special requests or requirements..."
                  />
                </div>
              </>
            )}
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm
                  bookingId={bookingDetails?.booking?.id}
                  onSuccess={() => {
                    router.push(`/booking-confirmation?id=${bookingDetails?.booking?.id}`);
                  }}
                />
              </Elements>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
