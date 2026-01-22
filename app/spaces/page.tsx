'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SpaceWithDetails, UsageType, SpaceType } from '@/types';
import { APP_NAME } from '@/lib/config/app';

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    space_type: '' as SpaceType | '',
    usage_type: '' as UsageType | '',
    min_price: '',
    max_price: '',
    min_size: '',
  });

  useEffect(() => {
    fetchSpaces();
  }, [filters]);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.space_type) params.append('space_type', filters.space_type);
      if (filters.usage_type) params.append('usage_type', filters.usage_type);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.min_size) params.append('min_size', filters.min_size);

      const response = await fetch(`/api/spaces?${params.toString()}`);
      const data = await response.json();
      setSpaces(data.data || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcons = (amenities: any) => {
    const icons = [];
    if (amenities?.electricity) icons.push({ icon: '⚡', label: 'Electricity' });
    if (amenities?.water_access) icons.push({ icon: '💧', label: 'Water' });
    if (amenities?.restrooms) icons.push({ icon: '🚻', label: 'Restrooms' });
    if (amenities?.wifi) icons.push({ icon: '📶', label: 'WiFi' });
    if (amenities?.garbage_access) icons.push({ icon: '🗑️', label: 'Garbage' });
    if (amenities?.water_dump) icons.push({ icon: '🚿', label: 'Water Dump' });
    return icons;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              {APP_NAME}
            </Link>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
              >
                Log In
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Available Spaces
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Find the perfect location for your business
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-3xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by city or state..."
                value={filters.city || filters.state}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({ ...filters, city: value, state: '' });
                }}
                className="w-full px-6 py-4 pr-12 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Advanced Filters</h2>
            <button
              onClick={() =>
                setFilters({
                  city: '',
                  state: '',
                  space_type: '',
                  usage_type: '',
                  min_price: '',
                  max_price: '',
                  min_size: '',
                })
              }
              className="text-sm text-gray-600 hover:text-primary-600 font-medium"
            >
              Clear All Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="State"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <select
              value={filters.space_type}
              onChange={(e) => setFilters({ ...filters, space_type: e.target.value as SpaceType })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Space Types</option>
              <option value="parking_lot">Parking Lot</option>
              <option value="storefront">Storefront</option>
              <option value="vacant_land">Vacant Land</option>
              <option value="warehouse">Warehouse</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filters.usage_type}
              onChange={(e) => setFilters({ ...filters, usage_type: e.target.value as UsageType })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Usage Types</option>
              <option value="food_truck">Food Truck</option>
              <option value="drive_thru">Drive Thru</option>
              <option value="retail">Retail</option>
              <option value="stand">Stand</option>
              <option value="pop_up">Pop Up</option>
              <option value="event">Event</option>
            </select>
            <input
              type="number"
              placeholder="Min Price/Month"
              value={filters.min_price}
              onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max Price/Month"
              value={filters.max_price}
              onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Min Size (sqft)"
              value={filters.min_size}
              onChange={(e) => setFilters({ ...filters, min_size: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {spaces.length} {spaces.length === 1 ? 'space' : 'spaces'}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading spaces...</p>
          </div>
        )}

        {/* Space Listings */}
        {!loading && spaces.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No spaces found matching your criteria.</p>
          </div>
        )}

        {!loading && spaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const primaryImage = space.space_images?.find((img: any) => img.is_primary) || space.space_images?.[0];
              const amenityIcons = getAmenityIcons(space.space_amenities);

              return (
                <Link
                  key={space.id}
                  href={`/spaces/${space.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    {primaryImage ? (
                      <img
                        src={primaryImage.image_url}
                        alt={space.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {space.instant_book && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Instant Book
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                      {space.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {space.city}, {space.state}
                    </p>

                    {/* Amenities */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {amenityIcons.slice(0, 6).map((amenity, index) => (
                        <span
                          key={index}
                          className="text-lg"
                          title={amenity.label}
                        >
                          {amenity.icon}
                        </span>
                      ))}
                    </div>

                    {/* Size */}
                    {space.size_sqft && (
                      <p className="text-sm text-gray-600 mb-2">
                        {space.size_sqft.toLocaleString()} sqft
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-2xl font-bold text-primary-600">
                          ${space.price_per_month}
                          <span className="text-sm text-gray-600 font-normal">/month</span>
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
