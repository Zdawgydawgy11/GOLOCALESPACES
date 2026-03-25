'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { DEMO_LISTINGS, DemoListing } from '@/lib/demo-listings';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

const SPACE_TYPES = [
  { value: '', label: 'All types' },
  { value: 'parking_lot', label: 'Parking Lot' },
  { value: 'storefront', label: 'Storefront' },
  { value: 'vacant_land', label: 'Vacant Land' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'other', label: 'Other' },
];

const SIZE_OPTIONS = [
  { value: '', label: 'Any size' },
  { value: '0-500', label: 'Under 500 sqft' },
  { value: '500-1000', label: '500-1,000 sqft' },
  { value: '1000-2500', label: '1,000-2,500 sqft' },
  { value: '2500-99999', label: '2,500+ sqft' },
];

const AMENITY_FILTERS = [
  { key: 'electricity', label: 'Electricity' },
  { key: 'water_access', label: 'Water' },
  { key: 'restrooms', label: 'Restrooms' },
  { key: 'parking', label: 'Parking' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'garbage_access', label: 'Trash' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={'w-3 h-3 ' + (i < Math.floor(rating) ? 'text-rose-500' : 'text-gray-200')}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function SpaceCard({ space, selected, onSelect }: { space: DemoListing; selected: boolean; onSelect?: () => void }) {
  const img = space.images?.[0]?.image_url;
  return (
    <div
      id={'card-' + space.id}
      className={'group bg-white rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg ' + (selected ? 'ring-2 ring-rose-500 shadow-lg' : 'border-gray-100')}
      onClick={onSelect}
    >
      <Link href={'/spaces/' + space.id} className="block">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {img && (
            <Image
              src={img}
              alt={space.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {space.instant_book && (
            <div className="absolute top-2 left-2 bg-white text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
              Instant Book
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1">{space.title}</p>
            <div className="flex items-center gap-1 shrink-0">
              <StarRating rating={space.rating} />
              <span className="text-xs text-gray-500">{space.rating}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2">{space.city}, {space.state}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">{space.size_sqft.toLocaleString()} sqft</p>
            <p className="text-sm font-bold text-gray-900">
              ${space.price_per_day}<span className="font-normal text-gray-500">/day</span>
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function SpacesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [spaces, setSpaces] = useState<DemoListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [startDate, setStartDate] = useState(searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end') || '');
  const [size, setSize] = useState(searchParams.get('size') || '');
  const [spaceType, setSpaceType] = useState(searchParams.get('space_type') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [amenities, setAmenities] = useState<Record<string, boolean>>({});

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (spaceType) params.set('space_type', spaceType);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);

      const res = await fetch('/api/spaces?' + params.toString());
      const data = await res.json();
      const apiSpaces = data.data || [];

      if (apiSpaces.length > 0) {
        setSpaces(
          apiSpaces.map((s: any) => ({
            ...s,
            images: s.space_images || [],
            amenities: s.space_amenities?.[0] || s.amenities || {},
            rating: s.average_rating || 4.5,
            review_count: s.review_count || 0,
            featured: false,
            lat: s.lat || s.latitude || 0,
            lng: s.lng || s.longitude || 0,
          }))
        );
      } else {
        let demo = [...DEMO_LISTINGS];
        if (city) {
          const q = city.toLowerCase();
          demo = demo.filter(
            (l) =>
              l.city.toLowerCase().includes(q) ||
              l.state.toLowerCase().includes(q) ||
              (l.city + ', ' + l.state).toLowerCase().includes(q)
          );
        }
        if (spaceType) demo = demo.filter((l) => l.space_type === spaceType);
        if (minPrice) demo = demo.filter((l) => l.price_per_month >= parseFloat(minPrice));
        if (maxPrice) demo = demo.filter((l) => l.price_per_month <= parseFloat(maxPrice));
        setSpaces(demo);
      }
    } catch {
      let demo = [...DEMO_LISTINGS];
      if (city) {
        const q = city.toLowerCase();
        demo = demo.filter(
          (l) =>
            l.city.toLowerCase().includes(q) ||
            l.state.toLowerCase().includes(q)
        );
      }
      if (spaceType) demo = demo.filter((l) => l.space_type === spaceType);
      setSpaces(demo);
    } finally {
      setLoading(false);
    }
  }, [city, spaceType, minPrice, maxPrice]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const filteredSpaces = spaces.filter((s) => {
    if (size) {
      const parts = size.split('-').map(Number);
      if (s.size_sqft < parts[0] || s.size_sqft > parts[1]) return false;
    }
    for (const [key, required] of Object.entries(amenities)) {
      if (required && !(s.amenities as any)?.[key]) return false;
    }
    return true;
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (size) params.set('size', size);
    if (spaceType) params.set('space_type', spaceType);
    router.push('/spaces?' + params.toString());
  };

  const toggleAmenity = (key: string) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-1 gap-2 items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
              <input
                type="text"
                placeholder="Search city or state..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ' + (showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400')}
            >
              Filters
            </button>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Search
            </button>

            <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500')}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (viewMode === 'map' ? 'bg-white shadow text-gray-900' : 'text-gray-500')}
              >
                Map
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-4 items-start">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Space Type</label>
                  <div className="flex flex-wrap gap-2">
                    {SPACE_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setSpaceType(t.value)}
                        className={'px-3 py-1.5 rounded-full text-sm border transition-colors ' + (spaceType === t.value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-700')}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_FILTERS.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => toggleAmenity(a.key)}
                        className={'px-3 py-1.5 rounded-full text-sm border transition-colors ' + (amenities[a.key] ? 'bg-rose-600 text-white border-rose-600' : 'bg-white border-gray-200 text-gray-700')}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none"
                  >
                    {SIZE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Price / Month</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-24 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-24 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-sm text-gray-500 mb-4">
          {loading
            ? 'Loading...'
            : filteredSpaces.length + ' space' + (filteredSpaces.length !== 1 ? 's' : '') + ' found' + (city ? ' in "' + city + '"' : '')}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSpaces.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-semibold text-gray-900 mb-2">No spaces found</p>
            <p className="text-gray-500 mb-6">Try adjusting your filters or searching a different location.</p>
            <button
              onClick={() => {
                setCity('');
                setSpaceType('');
                setAmenities({});
                setSize('');
                setMinPrice('');
                setMaxPrice('');
                router.push('/spaces');
              }}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                selected={selectedId === space.id}
                onSelect={() => setSelectedId(space.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 h-[calc(100vh-260px)]">
            <div className="w-full lg:w-2/5 overflow-y-auto space-y-4 pr-2">
              {filteredSpaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  selected={selectedId === space.id}
                  onSelect={() => setSelectedId(space.id)}
                />
              ))}
            </div>
            <div className="hidden lg:block flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <MapView
                listings={filteredSpaces}
                selectedId={selectedId}
                onMarkerClick={(id) => {
                  setSelectedId(id);
                  const el = document.getElementById('card-' + id);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpacesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <SpacesContent />
    </Suspense>
  );
}
