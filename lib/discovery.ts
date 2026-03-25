import type { ListingCardModel, VerificationTier } from './types';

export function formatTierLabel(tier?: VerificationTier) {
  switch (tier) {
    case 'marketspace_reviewed':
      return 'Reviewed by MarketSpace';
    case 'docs_uploaded':
      return 'Docs uploaded';
    case 'source_linked':
      return 'Source linked';
    default:
      return 'Host provided';
  }
}

export function scoreListingForDiscovery(listing: any): number {
  let score = 0;

  if (listing.featured) score += 20;
  if (listing.completeness_score) score += Math.min(30, listing.completeness_score / 4);
  if (listing.instant_book_enabled) score += 8;
  if (listing.workflow_mode === 'permit_dependent') score += 2;
  if (listing.workflow_mode === 'request_to_book') score += 4;
  if (listing.listing_media?.length) score += Math.min(12, listing.listing_media.length * 2);
  if (listing.verification_tier === 'marketspace_reviewed') score += 12;
  if (listing.verification_tier === 'docs_uploaded') score += 8;
  if (listing.verification_tier === 'source_linked') score += 5;
  if (listing.profiles?.is_super_host) score += 10;
  if (listing.profiles?.host_rating) score += Math.min(10, Number(listing.profiles.host_rating) * 2);

  return score;
}

export function mapListingToCard(listing: any): ListingCardModel {
  const attrs = listing.listing_attributes || [];
  const flags = listing.listing_discovery_flags?.[0] || {};
  const location = listing.listing_locations?.[0];
  const media = listing.listing_media || [];
  const baseRule = (listing.pricing_rules || []).find((r: any) => r.rule_type === 'base');
  const getAttr = (key: string) => attrs.find((a: any) => a.key === key)?.value_json?.value ?? attrs.find((a: any) => a.key === key)?.value_json;

  return {
    id: listing.id,
    title: listing.title,
    city: location?.city,
    region: location?.region,
    heroImage: media.find((m: any) => m.kind === 'image')?.url,
    heroVideo: media.find((m: any) => m.kind === 'video')?.url,
    priceFromCents: baseRule?.amount_cents ?? 0,
    squareFeet: Number(getAttr('square_feet') || 0) || undefined,
    zoningLabel: getAttr('listed_zoning_label') || undefined,
    rating: Number(listing.profiles?.host_rating || listing.rating || 0) || undefined,
    reviewCount: Number(listing.review_count || 0) || undefined,
    instantBookEnabled: !!listing.instant_book_enabled,
    workflowMode: listing.workflow_mode,
    verificationTier: listing.verification_tier,
    tags: (listing.listing_tags || []).map((t: any) => t.tag),
    discoveryFlags: {
      adjacent_to_park: flags.adjacent_to_park,
      dessert_only: flags.dessert_only,
      power_supplied: flags.power_supplied,
      zoning_reference_available: flags.zoning_reference_available,
      docs_uploaded: flags.docs_uploaded,
      minimum_insurance_cents: flags.minimum_insurance_cents,
      lease_term_label: flags.lease_term_label,
    },
    host: {
      name: listing.profiles?.full_name || listing.profiles?.display_name,
      is_super_host: !!listing.profiles?.is_super_host,
    },
  };
}
