// types/domain.ts
import type { Space, User } from './index';

export interface SpaceImage {
  id: string;
  space_id: string;
  url: string;
  alt_text?: string;
  sort_order?: number;
}

export interface SpaceAmenity {
  id: string;
  space_id: string;
  label: string;
  category?: string;
}

export interface SpaceWithDetails extends Space {
  amenities?: SpaceAmenity[];
  images?: SpaceImage[];
  avg_rating?: number;
  review_count?: number;
  owner?: Pick<User, 'id' | 'first_name' | 'last_name' | 'profile_image_url' | 'user_type'>;
  ai_summary?: string;
  ai_disclaimer?: string;
}

export interface SpaceSearchFilters {
  q?: string;
  city?: string;
  state?: string;
  space_type?: string;
  use_case?: string;
  min_price?: number;
  max_price?: number;
  min_sqft?: number;
  max_sqft?: number;
  has_power?: boolean;
  has_water?: boolean;
  has_trash?: boolean;
  climate_controlled?: boolean;
}
