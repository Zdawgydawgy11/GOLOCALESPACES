// types/booking.ts

import type { Space } from './index';

export interface BookingRequestInput {
  space_id: string;
  renter_id: string;

  start_date: string;
  end_date: string;

  business_name: string;
  use_case: string; // e.g., 'food_truck', 'warehouse_storage', 'restaurant_sublease'
  description_of_use: string;

  expected_duration_months?: number;
  required_sqft?: number;
  vehicle_dimensions?: string;
  special_requirements?: string;

  years_experience?: number;
  has_10_plus_years_experience?: boolean;
  resume_url?: string;
  references_text?: string;

  license_documents: string[];
  insurance_documents: string[];
  other_documents: string[];

  message_to_host: string;
}

export interface HostSpaceSettings {
  space_id: string;
  min_required_insurance_amount?: number;
  requires_food_permit?: boolean;
  requires_health_department_clearance?: boolean;

  cleaning_fee?: number;
  damage_deposit?: number;
  teardown_fee?: number;

  cancellation_policy_type: 'flexible' | 'moderate' | 'strict';
  free_cancel_days_before_start?: number;
  late_cancel_fee_percent?: number;

  lease_template_url?: string;
  allow_ai_lease_draft?: boolean;
  additional_terms_text?: string;
}

export interface BookingQuote {
  space: Space;
  start_date: string;
  end_date: string;
  total_days: number;
  total_months_equiv: number;
  base_host_rent: number;
  cleaning_fee: number;
  teardown_fee: number;
  damage_deposit: number;
  host_service_fee: number;
  renter_service_fee: number;
  total_payout_to_host: number;
  total_due_from_renter: number;
  currency: string;
}
