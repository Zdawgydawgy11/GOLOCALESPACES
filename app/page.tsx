import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import { scoreListingForDiscovery, mapListingToCard } from '@/lib/discovery';
import { HomeSearchBar } from '@/components/home/home-search-bar';
import { HomepageCarouselSection } from '@/components/home/homepage-carousel-section';
import { TrustStrip } from '@/components/home/trust-strip';
import { CategoryRow } from '@/components/home/category-row';

export default async function HomePage() {
  const supabase = await createServerSupabase();

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      *,
      profiles:owner_id (*),
      listing_locations (*),
      listing_attributes (*),
      listing_media (*),
      listing_tags (*),
      pricing_rules (*),
      listing_discovery_flags (*)
    `)
    .eq('status', 'published')
    .limit(60);

  const all = (listings || []).sort((a: any, b: any) => scoreListingForDiscovery(b) - scoreListingForDiscovery(a));
  const cards = all.map(mapListingToCard);

  const featured = cards.filter((c) => c.verificationTier === 'marketspace_reviewed' || c.host?.is_super_host).slice(0, 12);
  const foodTruck = cards.filter((c) => c.tags.includes('food-truck') || c.tags.includes('food truck') || c.discoveryFlags?.power_supplied).slice(0, 12);
  const dessertOnly = cards.filter((c) => c.discoveryFlags?.dessert_only).slice(0, 12);
  const highPower = cards.filter((c) => c.discoveryFlags?.power_supplied).slice(0, 12);
  const verified = cards.filter((c) => c.discoveryFlags?.zoning_reference_available || c.verificationTier !== 'host_provided').slice(0, 12);

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <HomeSearchBar />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
        <CategoryRow />
        <TrustStrip />

        <HomepageCarouselSection title="Featured spaces" subtitle="Strong hosts, complete listings, clearer trust signals" listings={featured} />
        <HomepageCarouselSection title="Popular for food trucks" listings={foodTruck} />
        <HomepageCarouselSection title="Dessert-only ready spots" listings={dessertOnly} />
        <HomepageCarouselSection title="High-power locations" listings={highPower} />
        <HomepageCarouselSection title="Recently verified references" listings={verified} />

        <section className="rounded-3xl border bg-neutral-50 p-6">
          <h2 className="text-2xl font-semibold">How MarketSpace works</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-medium">Discover</h3>
              <p className="mt-2 text-sm text-neutral-600">Browse real commercial-use spaces before you search, with pricing, location, zoning references, utilities, and restrictions surfaced early.</p>
            </div>
            <div>
              <h3 className="font-medium">Message + qualify</h3>
              <p className="mt-2 text-sm text-neutral-600">Message hosts inside MarketSpace, confirm use fit, and upload permits, setup photos, and insurance before requesting approval.</p>
            </div>
            <div>
              <h3 className="font-medium">Request or activate</h3>
              <p className="mt-2 text-sm text-neutral-600">For simple listings, request or book. For permit-dependent sites, move through a conditional approval workflow before activation.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border p-6">
            <h2 className="text-2xl font-semibold">For renters</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
              <li>Search by place, time, and space requirements</li>
              <li>See requirements before submitting a request</li>
              <li>Review lease summaries before full agreements</li>
              <li>Upload permits, insurance, and setup details in-platform</li>
            </ul>
          </div>
          <div className="rounded-3xl border p-6">
            <h2 className="text-2xl font-semibold">For hosts</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
              <li>Define exactly what is allowed and prohibited</li>
              <li>Use a structured stipulation builder</li>
              <li>Attach your own agreement or generate a draft to approve</li>
              <li>Track permit-dependent workflows without leaving the app</li>
            </ul>
            <Link href="/host/dashboard" className="mt-6 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">Become a host</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
