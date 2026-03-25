-- Host trust metrics
alter table if exists profiles
  add column if not exists is_super_host boolean default false,
  add column if not exists response_rate numeric default 0,
  add column if not exists avg_response_minutes integer default 0,
  add column if not exists acceptance_rate numeric default 0,
  add column if not exists completed_bookings_count integer default 0,
  add column if not exists host_rating numeric default 0,
  add column if not exists cancellation_rate numeric default 0;

-- Listing ranking / trust / discovery fields
alter table if exists listings
  add column if not exists completeness_score integer default 0,
  add column if not exists featured boolean default false,
  add column if not exists instant_book_enabled boolean default false,
  add column if not exists workflow_mode text default 'request_to_book', -- request_to_book | instant_book | permit_dependent
  add column if not exists verification_tier text default 'host_provided', -- host_provided | source_linked | docs_uploaded | marketspace_reviewed
  add column if not exists compliance_disclaimer text,
  add column if not exists lease_summary jsonb default '{}'::jsonb,
  add column if not exists requirements_summary jsonb default '{}'::jsonb;

-- Optional extra attributes for discovery
create table if not exists listing_discovery_flags (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  adjacent_to_park boolean default false,
  dessert_only boolean default false,
  power_supplied boolean default false,
  zoning_reference_available boolean default false,
  docs_uploaded boolean default false,
  minimum_insurance_cents integer,
  lease_term_label text,
  created_at timestamptz default now()
);

create index if not exists listing_discovery_flags_listing_idx on listing_discovery_flags(listing_id);

-- Conditional site offers for permit-dependent workflows
create table if not exists conditional_site_offers (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  renter_id uuid not null,
  host_id uuid not null,
  status text not null default 'issued', -- issued | accepted | expired | revoked
  body_markdown text not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Permit tracker
create table if not exists booking_permit_items (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  item_type text not null, -- health_permit | city_license | fire_clearance | coi | menu | setup_plan
  status text not null default 'missing', -- missing | uploaded | under_review | approved | rejected
  notes text,
  file_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Structured pre-message intake
create table if not exists listing_inquiry_intake (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid references message_threads(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  renter_id uuid not null,
  service_type text,
  requested_dates text,
  staff_count integer,
  permits_held text,
  power_needs text,
  setup_type text,
  is_mobile boolean,
  notes text,
  created_at timestamptz default now()
);
