'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';

interface Space {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  space_type: string;
  price_per_month: number;
  price_per_day: number;
  status: string;
  created_at: string;
  space_images: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
}

export default function MySpacesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      // Fetch user's spaces
      const response = await fetch(`/api/spaces/owner/${currentUser.id}`);
      const data = await response.json();

      if (data.success) {
        setSpaces(data.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (space: Space) => {
    const primaryImage = space.space_images?.find(img => img.is_primary);
    return primaryImage?.image_url || space.space_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              GoLocal Spaces
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-primary-600 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Spaces</h1>
            <p className="text-gray-600">Manage your property listings</p>
          </div>
          <Link
            href="/dashboard/spaces/new"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            Add New Space
          </Link>
        </div>

        {spaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No spaces yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating your first space listing.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/spaces/new"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Space
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <div key={space.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={getPrimaryImage(space)}
                    alt={space.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      space.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {space.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                    {space.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {space.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {space.city}, {space.state}
                  </div>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${space.price_per_month}
                      </span>
                      <span className="text-gray-600 text-sm">/month</span>
                    </div>
                    {space.price_per_day && (
                      <span className="text-sm text-gray-600">
                        ${space.price_per_day}/day
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/spaces/${space.id}/edit`}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition text-sm font-semibold"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/spaces/${space.id}`}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
