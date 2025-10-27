// User Types
export type UserType = 'landlord' | 'vendor' | 'both';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: UserType;
  profile_image_url?: string;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
}

// Vendor Profile - for tracking vendor experience and qualifications
export interface VendorProfile {
  id: string;
  user_id: string;
  business_name?: string;
  business_type?: string;
  years_of_experience?: number;
  applicable_events?: string; // Comma-separated list or JSON
  references?: string; // Contact information for references
  estimated_monthly_sales?: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// Space Types
export type SpaceType = 'parking_lot' | 'storefront' | 'vacant_land' | 'warehouse' | 'other';
export type SpaceStatus = 'active' | 'inactive' | 'pending_verification';
export type UsageType = 'food_truck' | 'drive_thru' | 'retail' | 'stand' | 'pop_up' | 'event' | 'other';
export type RentalPeriodUnit = 'days' | 'months' | 'years';

export interface Space {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  space_type: SpaceType;
  size_sqft?: number;
  price_per_day: number;
  price_per_week?: number;
  price_per_month?: number;
  instant_book: boolean;
  status: SpaceStatus;

  // Extended landlord requirements
  allowed_usage_types?: UsageType[];
  allowed_business_types?: string[]; // Array of business types allowed
  operating_hours?: string; // e.g., "6am-10pm Mon-Fri"
  insurance_requirements?: string;
  rental_period_length?: number; // Length of rental period
  rental_period_unit?: RentalPeriodUnit; // Unit for rental period
  payment_collection_day?: number; // Day of month for rent collection (1-31)
  vendor_experience_required?: number; // Years of experience required
  additional_terms?: string; // Any other terms/qualifications

  created_at: Date;
  updated_at: Date;
}

export interface SpaceAmenities {
  id: string;
  space_id: string;
  electricity: boolean;
  water_access: boolean;
  restrooms: boolean;
  parking: boolean;
  wifi: boolean;
  storage: boolean;
  security_camera: boolean;
  covered: boolean;
  high_traffic: boolean;
  garbage_access: boolean; // Dumpster/garbage access
  water_dump: boolean; // Water dump access for RVs/food trucks
  created_at: Date;
}

export interface SpaceImage {
  id: string;
  space_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: Date;
}

export interface SpaceAvailability {
  id: string;
  space_id: string;
  available_from: Date;
  available_to: Date;
  is_blocked: boolean;
  created_at: Date;
}

// Full space with relations
export interface SpaceWithDetails extends Space {
  amenities?: SpaceAmenities;
  images: SpaceImage[];
  owner: Pick<User, 'id' | 'first_name' | 'last_name' | 'profile_image_url' | 'verified'>;
  averageRating?: number;
  totalReviews?: number;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'declined';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial_refund';

export interface Booking {
  id: string;
  space_id: string;
  vendor_id: string;
  landlord_id: string;
  start_date: Date;
  end_date: Date;
  total_price: number;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  stripe_payment_intent_id?: string;
  special_requests?: string;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BookingWithDetails extends Booking {
  space: Space;
  vendor: Pick<User, 'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'profile_image_url'>;
  landlord: Pick<User, 'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'profile_image_url'>;
}

// Review Types
export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  space_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewWithDetails extends Review {
  reviewer: Pick<User, 'id' | 'first_name' | 'last_name' | 'profile_image_url'>;
  space?: Pick<Space, 'id' | 'title'>;
}

// Message Types
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id?: string;
  message_text: string;
  is_read: boolean;
  created_at: Date;
}

export interface MessageWithDetails extends Message {
  sender: Pick<User, 'id' | 'first_name' | 'last_name' | 'profile_image_url'>;
  receiver: Pick<User, 'id' | 'first_name' | 'last_name' | 'profile_image_url'>;
}

// Notification Types
export type NotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'new_message'
  | 'review_received'
  | 'payment_received';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: Date;
}

// Favorite Types
export interface Favorite {
  id: string;
  user_id: string;
  space_id: string;
  created_at: Date;
}

// Transaction Types
export type TransactionType = 'payment' | 'refund' | 'payout';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  booking_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  platform_fee: number;
  stripe_charge_id?: string;
  stripe_transfer_id?: string;
  transaction_type: TransactionType;
  transaction_status: TransactionStatus;
  created_at: Date;
}

// Verification Types
export type VerificationType = 'email' | 'phone' | 'id_document' | 'business_license';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserVerification {
  id: string;
  user_id: string;
  verification_type: VerificationType;
  verification_status: VerificationStatus;
  document_url?: string;
  notes?: string;
  verified_at?: Date;
  created_at: Date;
}

// Search and Filter Types
export interface SpaceSearchFilters {
  city?: string;
  state?: string;
  space_type?: SpaceType;
  min_price?: number;
  max_price?: number;
  min_size?: number;
  amenities?: Partial<SpaceAmenities>;
  start_date?: Date;
  end_date?: Date;
  latitude?: number;
  longitude?: number;
  radius_miles?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
