'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { DEMO_LISTINGS, DemoListing } from '@/lib/demo-listings';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

const AMENITIES_LIST = [
  { key: 'electricity', label: 'Electricity', emoji: 'e' },
  { key: 'water_access', label: 'Water Access', emoji: 'w' },
  { key: 'restrooms', label: 'Restrooms', emoji: 'r' },
  { key: 'parking', label: 'Parking', emoji: 'p' },
  { key: 'wifi', label: 'WiFi', emoji: 'n' },
  { key: 'garbage_access', label: 'Garbage Access', emoji: 't' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={'w-4 h-4 ' + (i < Math.floor(rating) ? 'text-rose-500' : 'text-gray-200')}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [space, setSpace] = useState<DemoListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const res = await fetch('/api/spaces/' + params.id);
        const data = await res.json();
        if (data.success && data.data) {
          const s = data.data;
          setSpace({
            ...s,
            images: s.space_images || [],
            amenities: s.space_amenities?.[0] || s.amenities || {},
            rating: s.average_rating || 4.5,
            review_count: s.review_count || 0,
            featured: s.featured || false,
            lat: s.lat || s.latitude || 0,
            lng: s.lng || s.longitude || 0,
          });
          setLoading(false);
          return;
        }
      } catch {
        // fall through
      }
      const demo = DEMO_LISTINGS.find((l) => l.id === params.id);
      setSpace(demo || null);
      setLoading(false);
    })();
  }, [params.id]);

  const images = space?.images || [];
  const amenities = space?.amenities || {};

  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const estimatedCost = days > 0 && space ? days * space.price_per_day : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-xl font-semibold text-gray-900 mb-3">Space not found</p>
          <Link href="/spaces" className="text-rose-600 hover:underline">
            Browse all spaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Photo Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-80 sm:h-96">
          <div
            className="col-span-2 row-span-2 relative cursor-pointer bg-gray-200"
            onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
          >
            {images[0] && (
              <Image
                src={images[0].image_url}
                alt={space.title}
                fill
                unoptimized
                className="object-cover hover:opacity-95 transition-opacity"
              />
            )}
          </div>
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="relative cursor-pointer bg-gray-100"
              onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
            >
              {images.length > 0 ? (
                <Image
                  src={images[idx % images.length].image_url}
                  alt={'Photo ' + (idx + 1)}
                  fill
                  unoptimized
                  className={'object-cover hover:opacity-95 transition-opacity' + (idx >= images.length ? ' opacity-60' : '')}
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
          ))}
          <button
            onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
            className="absolute bottom-4 right-4 bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm z-10"
          >
            Show all photos
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{space.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
                <span>{space.city}, {space.state} {space.zip_code}</span>
                <span>·</span>
                <span>{space.size_sqft?.toLocaleString()} sqft</span>
                <span>·</span>
                <span className="capitalize">{space.space_type?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={space.rating} />
                <span className="font-semibold">{space.rating}</span>
                <span className="text-gray-500">({space.review_count} reviews)</span>
                {space.instant_book && (
                  <span className="ml-2 text-green-600 font-medium text-sm">Instant Book available</span>
                )}
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xl shrink-0">
                H
              </div>
              <div>
                <p className="font-semibold text-gray-900">Hosted by a local property owner</p>
                <p className="text-sm text-gray-500">Superhost · Member since 2024</p>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About this space</h2>
              <p className="text-gray-700 leading-relaxed">{space.description}</p>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 gap-4">
                {AMENITIES_LIST.map((a) => {
                  const has = (amenities as any)[a.key];
                  return (
                    <div
                      key={a.key}
                      className={'flex items-center gap-3 text-sm ' + (has ? 'text-gray-800' : 'text-gray-300')}
                    >
                      <div className={'w-6 h-6 rounded-full flex items-center justify-center text-xs ' + (has ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400')}>
                        {has ? '✓' : '×'}
                      </div>
                      <span className={has ? '' : 'line-through'}>{a.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="border-gray-200" />

            {space.lat && space.lng ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                <div className="h-48 rounded-2xl overflow-hidden border border-gray-200">
                  <MapView listings={[space]} />
                </div>
                <p className="text-sm text-gray-500 mt-2">{space.city}, {space.state} {space.zip_code}</p>
              </div>
            ) : null}
          </div>

          {/* Right: Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-xl p-6 space-y-5">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${space.price_per_day}
                  <span className="text-base font-normal text-gray-500"> / day</span>
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  or ${space.price_per_month?.toLocaleString()} / month
                </p>
              </div>

              <div className="border border-gray-300 rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-gray-300">
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start</label>
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-sm text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">End</label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-sm text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {days > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>${space.price_per_day} x {days} day{days > 1 ? 's' : ''}</span>
                    <span>${estimatedCost}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>${estimatedCost}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  const base = '/checkout?space_id=' + space.id;
                  const dateParams = startDate && endDate
                    ? '&start_date=' + startDate + '&end_date=' + endDate
                    : '';
                  router.push(base + dateParams);
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors"
              >
                Request to Book
              </button>

              <Link
                href="/dashboard/messages"
                className="block w-full py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl text-center transition-colors"
              >
                Contact Host
              </Link>

              <p className="text-xs text-gray-400 text-center">
                You will need an account to complete booking.
              </p>

              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-rose-600 transition-colors"
              >
                <svg
                  className={'w-4 h-4 ' + (isFavorited ? 'text-rose-500' : '')}
                  fill={isFavorited ? 'currentColor' : 'none'}
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
                {isFavorited ? 'Saved to favorites' : 'Save to favorites'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
            onClick={() => setLightboxOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/20 hover:bg-white/30"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            className="max-w-4xl max-h-[80vh] relative w-full mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex % images.length].image_url}
              alt={'Photo ' + (lightboxIndex + 1)}
              className="w-full h-full object-contain max-h-[80vh] rounded-lg"
            />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/20 hover:bg-white/30"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex + 1) % images.length);
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  );
}
