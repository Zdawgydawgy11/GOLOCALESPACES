import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabase } from '@/lib/supabase/server';
import { DEMO_LISTINGS, DemoListing } from '@/lib/demo-listings';
import { SearchBar } from '@/components/search/SearchBar';

const CATEGORIES = [
  { icon: '🚚', label: 'Food Truck', value: 'food_truck' },
  { icon: '🏪', label: 'Storefront', value: 'storefront' },
  { icon: '🅿️', label: 'Parking Lot', value: 'parking_lot' },
  { icon: '🏭', label: 'Warehouse', value: 'warehouse' },
  { icon: '🎪', label: 'Pop-up', value: 'pop_up' },
  { icon: '🎉', label: 'Event Space', value: 'event' },
  { icon: '🚗', label: 'Drive-Thru', value: 'drive_thru' },
  { icon: '🌿', label: 'Vacant Land', value: 'vacant_land' },
];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < full ? 'text-rose-500' : i === full && half ? 'text-rose-300' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function ListingCard({ listing }: { listing: DemoListing }) {
  const img = listing.images?.[0]?.image_url;
  return (
    <Link href={`/spaces/${listing.id}`} className="group block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-3">
        {img && (
          <Image
            src={img}
            alt={listing.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {listing.instant_book && (
          <div className="absolute top-3 left-3 bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            ⚡ Instant Book
          </div>
        )}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm">
          <svg className="w-4 h-4 text-gray-600 hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1 flex-1">
            {listing.title}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <StarRating rating={listing.rating} />
            <span className="text-xs text-gray-500">{listing.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">{listing.city}, {listing.state}</p>
        <p className="text-xs text-gray-400">{listing.size_sqft.toLocaleString()} sqft</p>
        <p className="text-sm text-gray-900">
          <span className="font-semibold">${listing.price_per_day}</span>
          <span className="text-gray-500"> / day</span>
        </p>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  let listings: DemoListing[] = [];
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('spaces')
      .select('*, space_images(*), space_amenities(*)')
      .eq('is_active', true)
      .limit(12);
    if (data && data.length > 0) {
      listings = data.map((s: any) => ({
        ...s,
        images: s.space_images || [],
        amenities: s.space_amenities?.[0] || s.amenities || {},
        rating: s.average_rating || 4.5,
        review_count: s.review_count || 0,
        featured: s.featured || false,
      }));
    }
  } catch {
    // fall through to demo data
  }

  if (listings.length === 0) {
    listings = DEMO_LISTINGS;
  }

  const featured = listings.filter((l) => l.featured).slice(0, 4);
  const displayListings = featured.length >= 4 ? featured : listings.slice(0, 8);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-50 via-white to-orange-50 pt-16 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Find your perfect
            <br />
            <span className="text-rose-600">commercial space</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Browse food truck spots, storefronts, parking lots and more
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Category Pills */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/spaces?space_type=${cat.value}`}
                className="flex flex-col items-center gap-1.5 min-w-[72px] px-4 py-3 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-colors group shrink-0"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-600 group-hover:text-rose-600 whitespace-nowrap">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured spaces near you</h2>
            <p className="text-gray-500 mt-1 text-sm">Top-rated commercial spaces across the US</p>
          </div>
          <Link
            href="/spaces"
            className="text-sm font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing as DemoListing} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">How Market Space works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                title: 'Search',
                desc: 'Browse hundreds of commercial spaces by location, size, and type. Filter by amenities and price.',
              },
              {
                icon: '💬',
                title: 'Message',
                desc: 'Connect directly with space owners. Ask questions, negotiate terms, and confirm fit.',
              },
              {
                icon: '🗝️',
                title: 'Book',
                desc: 'Request to book or use Instant Book. Sign agreements online and pay securely.',
              },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gray-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">List your space</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Turn your vacant lot, storefront, or parking area into a revenue stream.
            Join thousands of property owners already earning on Market Space.
          </p>
          <Link
            href="/dashboard/spaces/new"
            className="inline-flex items-center px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors text-lg shadow-lg"
          >
            Get started for free →
          </Link>
        </div>
      </section>
    </main>
  );
}
