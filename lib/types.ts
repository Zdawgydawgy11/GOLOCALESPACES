export type WorkflowMode = 'request_to_book' | 'instant_book' | 'permit_dependent';
export type VerificationTier = 'host_provided' | 'source_linked' | 'docs_uploaded' | 'marketspace_reviewed';

export interface HostTrustMetrics {
  is_super_host: boolean;
  response_rate: number;
  avg_response_minutes: number;
  acceptance_rate: number;
  completed_bookings_count: number;
  host_rating: number;
  cancellation_rate: number;
}

export interface ComplianceReference {
  source_type: 'host_attestation' | 'official_gis' | 'manual_review' | 'uploaded_doc' | 'external_link';
  verdict: 'unknown' | 'allowed' | 'restricted' | 'not_allowed';
  summary?: string;
  details?: Record<string, unknown>;
  source_url?: string;
  retrieved_at?: string;
}

export interface DiscoveryFlags {
  adjacent_to_park?: boolean;
  dessert_only?: boolean;
  power_supplied?: boolean;
  zoning_reference_available?: boolean;
  docs_uploaded?: boolean;
  minimum_insurance_cents?: number | null;
  lease_term_label?: string | null;
}

export interface ListingCardModel {
  id: string;
  title: string;
  city?: string;
  region?: string;
  heroImage?: string;
  heroVideo?: string;
  priceFromCents: number;
  squareFeet?: number;
  zoningLabel?: string;
  rating?: number;
  reviewCount?: number;
  instantBookEnabled?: boolean;
  workflowMode?: WorkflowMode;
  verificationTier?: VerificationTier;
  tags: string[];
  discoveryFlags?: DiscoveryFlags;
  host?: {
    name?: string;
    is_super_host?: boolean;
  };
}

export interface HomepageSection {
  title: string;
  subtitle?: string;
  listings: ListingCardModel[];
}
