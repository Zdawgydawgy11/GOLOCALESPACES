import Link from 'next/link';
import Image from 'next/image';
import type { ListingCardModel } from '@/lib/types';

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function VerificationBadge({ tier }: { tier?: string }) {
  if (!tier || tier === 'host_provided') return null;
  const labels: Record<string, string> = {
    marketspace_reviewed: 'Verified',
    docs_uploaded: 'Docs on file',
    source_linked: 'Source linked',
  };
  return (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
      {labels[tier] ?? tier}
    </span>
  );
}

export function ListingCard({ listing }: { listing: ListingCardModel }) {
  const location = [listing.city, listing.region].filter(Boolean).join(', ');
  const price = listing.priceFromCents ? `${formatPrice(listing.priceFromCents)} / day` : 'Contact for price';

  return (
    <Link href={`/spaces/${listing.id}`} className="group block rounded-2xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow duration-200 bg-white">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
        {listing.heroImage ? (
          <Image
            src={listing.heroImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400 text-sm">No photo</div>
        )}
        {listing.instantBookEnabled && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
            Instant Book
          </span>
        )}
        {listing.host?.is_super_host && (
          <span className="absolute top-3 right-3 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Superhost
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-neutral-900 leading-snug line-clamp-2 flex-1">
            {listing.title}
          </h3>
          {listing.rating ? (
            <div className="flex items-center gap-1 text-xs text-neutral-700 shrink-0">
              <svg className="w-3.5 h-3.5 fill-neutral-800" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              {listing.rating.toFixed(1)}
              {listing.reviewCount ? <span className="text-neutral-400">({listing.reviewCount})</span> : null}
            </div>
          ) : null}
        </div>

        {location && <p className="text-xs text-neutral-500">{location}</p>}

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <VerificationBadge tier={listing.verificationTier} />
          {listing.squareFeet ? (
            <span className="text-xs text-neutral-500">{listing.squareFeet.toLocaleString()} sq ft</span>
          ) : null}
          {listing.zoningLabel ? (
            <span className="text-xs text-neutral-500">· {listing.zoningLabel}</span>
          ) : null}
        </div>

        <p className="text-sm font-semibold text-neutral-900 pt-1">{price}</p>
      </div>
    </Link>
  );
}
