-- First, get a user ID to use as the owner (we'll use the first user in the system)
-- You can replace this with a specific user ID if needed

-- Sample Space 1: Downtown Parking Lot
INSERT INTO spaces (
    owner_id,
    title,
    description,
    address,
    city,
    state,
    zip_code,
    latitude,
    longitude,
    space_type,
    size_sqft,
    price_per_day,
    price_per_month,
    instant_book,
    allowed_usage_types,
    operating_hours,
    status
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Downtown Parking Lot - Prime Location',
    'Perfect spot for food trucks, pop-up shops, or mobile vendors. High foot traffic area near office buildings and shopping district. Space includes 3 marked parking spots that can accommodate trucks up to 30ft.',
    '123 Main Street',
    'Provo',
    'Utah',
    '84601',
    40.2338,
    -111.6585,
    'parking_lot',
    1500,
    150.00,
    3500.00,
    true,
    ARRAY['food_truck', 'mobile_vendor', 'pop_up_shop'],
    'Monday-Saturday 7AM-10PM, Sunday 9AM-6PM',
    'active'
);

-- Add amenities for Space 1
INSERT INTO space_amenities (
    space_id,
    electricity,
    water_access,
    restrooms,
    parking,
    wifi,
    high_traffic,
    garbage_access
) VALUES (
    (SELECT id FROM spaces WHERE title = 'Downtown Parking Lot - Prime Location'),
    true,
    true,
    true,
    true,
    false,
    true,
    true
);

-- Add images for Space 1
INSERT INTO space_images (
    space_id,
    image_url,
    is_primary,
    display_order
) VALUES
(
    (SELECT id FROM spaces WHERE title = 'Downtown Parking Lot - Prime Location'),
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800',
    true,
    0
),
(
    (SELECT id FROM spaces WHERE title = 'Downtown Parking Lot - Prime Location'),
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    false,
    1
);

-- Sample Space 2: Shopping Center Corner Spot
INSERT INTO spaces (
    owner_id,
    title,
    description,
    address,
    city,
    state,
    zip_code,
    latitude,
    longitude,
    space_type,
    size_sqft,
    price_per_day,
    price_per_month,
    instant_book,
    allowed_usage_types,
    operating_hours,
    status
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Shopping Center Corner - High Visibility',
    'Premium corner location at busy shopping center. Perfect for seasonal vendors, artists, or specialty food vendors. Covered area with existing electrical hookups. Thousands of shoppers pass by daily.',
    '456 University Avenue',
    'Provo',
    'Utah',
    '84602',
    40.2444,
    -111.6492,
    'storefront',
    800,
    200.00,
    4500.00,
    false,
    ARRAY['retail_kiosk', 'seasonal_vendor', 'food_truck'],
    'Monday-Saturday 9AM-9PM',
    'active'
);

-- Add amenities for Space 2
INSERT INTO space_amenities (
    space_id,
    electricity,
    water_access,
    restrooms,
    parking,
    wifi,
    covered,
    high_traffic,
    security_camera
) VALUES (
    (SELECT id FROM spaces WHERE title = 'Shopping Center Corner - High Visibility'),
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    true
);

-- Add images for Space 2
INSERT INTO space_images (
    space_id,
    image_url,
    is_primary,
    display_order
) VALUES
(
    (SELECT id FROM spaces WHERE title = 'Shopping Center Corner - High Visibility'),
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    true,
    0
),
(
    (SELECT id FROM spaces WHERE title = 'Shopping Center Corner - High Visibility'),
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    false,
    1
);

-- Sample Space 3: Community Market Booth
INSERT INTO spaces (
    owner_id,
    title,
    description,
    address,
    city,
    state,
    zip_code,
    latitude,
    longitude,
    space_type,
    size_sqft,
    price_per_day,
    price_per_month,
    instant_book,
    allowed_usage_types,
    operating_hours,
    status
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Weekend Farmers Market Space',
    'Join our thriving weekend farmers market! 10x10 booth space perfect for artisans, bakers, farmers, and crafters. Includes table and tent setup. Great community atmosphere with regular customers.',
    '789 Center Street',
    'Orem',
    'Utah',
    '84057',
    40.2969,
    -111.6946,
    'outdoor',
    100,
    75.00,
    1200.00,
    true,
    ARRAY['farmers_market', 'artisan_booth'],
    'Saturday-Sunday 8AM-2PM',
    'active'
);

-- Add amenities for Space 3
INSERT INTO space_amenities (
    space_id,
    electricity,
    water_access,
    restrooms,
    parking,
    covered,
    high_traffic
) VALUES (
    (SELECT id FROM spaces WHERE title = 'Weekend Farmers Market Space'),
    true,
    true,
    true,
    true,
    true,
    true
);

-- Add images for Space 3
INSERT INTO space_images (
    space_id,
    image_url,
    is_primary,
    display_order
) VALUES
(
    (SELECT id FROM spaces WHERE title = 'Weekend Farmers Market Space'),
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
    true,
    0
);

-- Sample Space 4: Food Truck Commissary
INSERT INTO spaces (
    owner_id,
    title,
    description,
    address,
    city,
    state,
    zip_code,
    latitude,
    longitude,
    space_type,
    size_sqft,
    price_per_day,
    price_per_month,
    instant_book,
    allowed_usage_types,
    operating_hours,
    insurance_requirements,
    status
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Food Truck Park - Evening Events',
    'Join our popular food truck park! Evening spot (4PM-10PM) with established customer base. Full hookups including water, power, and waste disposal. Part of weekly food truck events with live music.',
    '321 State Street',
    'Provo',
    'Utah',
    '84601',
    40.2380,
    -111.6563,
    'parking_lot',
    400,
    125.00,
    2800.00,
    false,
    ARRAY['food_truck'],
    'Wednesday-Saturday 4PM-10PM',
    'General liability insurance required ($1M minimum)',
    'active'
);

-- Add amenities for Space 4
INSERT INTO space_amenities (
    space_id,
    electricity,
    water_access,
    restrooms,
    parking,
    wifi,
    garbage_access,
    water_dump,
    high_traffic
) VALUES (
    (SELECT id FROM spaces WHERE title = 'Food Truck Park - Evening Events'),
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    true
);

-- Add images for Space 4
INSERT INTO space_images (
    space_id,
    image_url,
    is_primary,
    display_order
) VALUES
(
    (SELECT id FROM spaces WHERE title = 'Food Truck Park - Evening Events'),
    'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800',
    true,
    0
),
(
    (SELECT id FROM spaces WHERE title = 'Food Truck Park - Evening Events'),
    'https://images.unsplash.com/photo-1513442542250-854d436a73f2?w=800',
    false,
    1
);

-- Sample Space 5: Vacant Lot for Pop-ups
INSERT INTO spaces (
    owner_id,
    title,
    description,
    address,
    city,
    state,
    zip_code,
    latitude,
    longitude,
    space_type,
    size_sqft,
    price_per_day,
    price_per_month,
    instant_book,
    allowed_usage_types,
    operating_hours,
    additional_terms,
    status
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Large Vacant Lot - Flexible Use',
    'Spacious lot perfect for weekend pop-up markets, vintage sales, or mobile vendor events. Paved surface with easy access. Flexible terms and willing to work with creative vendors. Great for testing new business concepts!',
    '555 Freedom Boulevard',
    'Provo',
    'Utah',
    '84604',
    40.2518,
    -111.6370,
    'vacant_lot',
    3000,
    100.00,
    2000.00,
    true,
    ARRAY['pop_up_shop', 'mobile_vendor', 'farmers_market', 'seasonal_vendor'],
    'Flexible - discuss with owner',
    'Minimum 2-day rental on weekends. Monthly rentals include storage options.',
    'active'
);

-- Add amenities for Space 5
INSERT INTO space_amenities (
    space_id,
    electricity,
    parking,
    high_traffic
) VALUES (
    (SELECT id FROM spaces WHERE title = 'Large Vacant Lot - Flexible Use'),
    true,
    true,
    false
);

-- Add images for Space 5
INSERT INTO space_images (
    space_id,
    image_url,
    is_primary,
    display_order
) VALUES
(
    (SELECT id FROM spaces WHERE title = 'Large Vacant Lot - Flexible Use'),
    'https://images.unsplash.com/photo-1567449303183-434f3b7e5995?w=800',
    true,
    0
);

-- Verify the spaces were created
SELECT COUNT(*) as total_spaces FROM spaces WHERE status = 'active';
