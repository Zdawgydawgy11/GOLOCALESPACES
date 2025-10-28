'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [space, setSpace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchSpaceDetails();
    }
  }, [params.id]);

  const fetchSpaceDetails = async () => {
    try {
      const response = await fetch(`/api/spaces/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setSpace(data.data);
      }
    } catch (error) {
      console.error('Error fetching space details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Space not found</p>
          <Link href="/spaces" className="text-primary-600 hover:underline">
            Browse all spaces
          </Link>
        </div>
      </div>
    );
  }

  const images = space.space_images || [];
  const amenities = space.space_amenities || {};
  const owner = space.users || {};

  const amenitiesList = [
    { key: 'electricity', label: 'Electricity', icon: '⚡' },
    { key: 'water_access', label: 'Water Access', icon: '💧' },
    { key: 'restrooms', label: 'Restrooms', icon: '🚻' },
    { key: 'parking', label: 'Parking', icon: '🅿️' },
    { key: 'wifi', label: 'WiFi', icon: '📶' },
    { key: 'storage', label: 'Storage', icon: '📦' },
    { key: 'security_camera', label: 'Security Camera', icon: '📹' },
    { key: 'covered', label: 'Covered', icon: '⛱️' },
    { key: 'high_traffic', label: 'High Traffic', icon: '🚗' },
    { key: 'garbage_access', label: 'Garbage Access', icon: '🗑️' },
    { key: 'water_dump', label: 'Water Dump', icon: '🚿' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              GoLocal Spaces
            </Link>
            <div className="flex gap-4">
              <Link
                href="/spaces"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
              >
                Browse Spaces
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {images.length > 0 ? (
            <div>
              <div className="relative h-96 bg-gray-200">
                <img
                  src={images[currentImageIndex]?.image_url}
                  alt={space.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-75"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-75"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img: any, index: number) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? 'border-primary-600'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-400">No images available</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {space.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {space.address}, {space.city}, {space.state} {space.zip_code}
              </p>
              {space.size_sqft && (
                <p className="text-gray-600">
                  Size: <span className="font-semibold">{space.size_sqft.toLocaleString()} sqft</span>
                </p>
              )}
            </div>

            {/* Description */}
            {space.description && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{space.description}</p>
              </div>
            )}

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesList.map((amenity) =>
                  amenities[amenity.key] ? (
                    <div key={amenity.key} className="flex items-center gap-2">
                      <span className="text-2xl">{amenity.icon}</span>
                      <span className="text-gray-700">{amenity.label}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>

            {/* Landlord Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Requirements & Terms</h2>
              <div className="space-y-4">
                {space.allowed_usage_types && space.allowed_usage_types.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Allowed Usage Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {space.allowed_usage_types.map((type: string) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          {type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {space.operating_hours && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Operating Hours</h3>
                    <p className="text-gray-700">{space.operating_hours}</p>
                  </div>
                )}

                {space.insurance_requirements && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Insurance Requirements</h3>
                    <p className="text-gray-700">{space.insurance_requirements}</p>
                  </div>
                )}

                {space.rental_period_length && space.rental_period_unit && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Rental Period</h3>
                    <p className="text-gray-700">
                      {space.rental_period_length} {space.rental_period_unit}
                    </p>
                  </div>
                )}

                {space.vendor_experience_required && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Experience Required</h3>
                    <p className="text-gray-700">
                      {space.vendor_experience_required} years minimum
                    </p>
                  </div>
                )}

                {space.additional_terms && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Additional Terms</h3>
                    <p className="text-gray-700 whitespace-pre-line">{space.additional_terms}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Property Owner</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {owner.profile_image_url ? (
                    <img
                      src={owner.profile_image_url}
                      alt={`${owner.first_name} ${owner.last_name}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-gray-400">👤</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {owner.first_name} {owner.last_name}
                    {owner.verified && (
                      <span className="ml-2 text-green-600">✓ Verified</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Property Owner</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ${space.price_per_month}
                  <span className="text-lg text-gray-600 font-normal">/month</span>
                </p>
                {space.price_per_day && (
                  <p className="text-gray-600">or ${space.price_per_day}/day</p>
                )}
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition mb-3"
              >
                Request Booking
              </button>

              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Contact Owner
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  You'll be asked to create an account or log in to proceed with booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Request Booking</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {startDate && endDate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Booking Summary:</p>
                  <p className="font-semibold">
                    {Math.ceil(
                      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Estimated cost: $
                    {(
                      (space.price_per_day || space.price_per_month / 30) *
                      Math.ceil(
                        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (startDate && endDate) {
                    router.push(
                      `/checkout?space_id=${space.id}&start_date=${startDate}&end_date=${endDate}`
                    );
                  }
                }}
                disabled={!startDate || !endDate}
                className={`flex-1 py-3 rounded-lg font-semibold transition text-center ${
                  startDate && endDate
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Checkout
              </button>
            </div>

            <button
              onClick={() => {
                setShowBookingModal(false);
                setStartDate('');
                setEndDate('');
              }}
              className="mt-4 w-full text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
