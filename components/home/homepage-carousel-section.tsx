import { ListingCard } from '@/components/search/listing-card';
import type { ListingCardModel } from '@/lib/types';

export function HomepageCarouselSection({ title, subtitle, listings }: { title: string; subtitle?: string; listings: ListingCardModel[] }) {
  if (!listings.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-neutral-600">{subtitle}</p> : null}
        </div>
      </div>
      <div className="grid grid-flow-col auto-cols-[85%] gap-4 overflow-x-auto pb-2 sm:auto-cols-[50%] lg:auto-cols-[32%]">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
