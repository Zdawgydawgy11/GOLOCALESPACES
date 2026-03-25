'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FavoriteSpace {
  id: string;
  favoriteId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  price_per_day: number;
  price_per_month: number;
  space_type: string;
  size_sqft: number;
  images: { id: string; image_url: string; is_primary: boolean; display_order: number }[];
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url?: string;
    verified: boolean;
  };
  addedAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteSpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/favorites');
      if (!response.ok) throw new Error('Failed to fetch favorites');

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (spaceId: string) => {
    try {
      const response = await fetch(`/api/favorites?spaceId=${spaceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove favorite');

      // Remove from local state
      setFavorites(prev => prev.filter(fav => fav.id !== spaceId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite. Please try again.');
    }
  };

  const getPrimaryImage = (images: FavoriteSpace['images']) => {
    const primary = images?.find(img => img.is_primary);
    return primary?.image_url || images?.[0]?.image_url || '/placeholder-space.jpg';
  };

  const formatSpaceType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Market Space
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">Spaces you've saved for later</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start browsing spaces and save your favorites to view them here
            </p>
            <Link
              href="/spaces"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Browse Spaces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((space) => (
              <div
                key={space.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
              >
                <Link href={`/spaces/${space.id}`} className="block">
                  <div className="relative h-48">
                    <Image
                      src={getPrimaryImage(space.images)}
                      alt={space.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFavorite(space.id);
                        }}
                        className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition"
                        title="Remove from favorites"
                      >
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {space.title}
                      </h3>
                      {space.owner.verified && (
                        <svg
                          className="w-5 h-5 text-blue-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {space.city}, {space.state}
                    </p>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {space.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {formatSpaceType(space.space_type)}
                      </span>
                      {space.size_sqft && (
                        <span className="text-xs text-gray-600">
                          {space.size_sqft.toLocaleString()} sq ft
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 pt-3 border-t border-gray-100">
                      <span className="text-xl font-bold text-primary-600">
                        ${space.price_per_day}
                      </span>
                      <span className="text-sm text-gray-500">/day</span>
                      {space.price_per_month && (
                        <span className="text-xs text-gray-500 ml-auto">
                          ${space.price_per_month}/mo
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
