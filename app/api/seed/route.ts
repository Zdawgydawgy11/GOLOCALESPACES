import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sampleSpaces = [
  {
    title: 'Downtown Parking Lot - Prime Location',
    description: 'Perfect spot for food trucks, pop-up shops, or mobile vendors. High foot traffic area near office buildings and shopping district. Space includes 3 marked parking spots that can accommodate trucks up to 30ft.',
    address: '123 Main Street',
    city: 'Provo',
    state: 'Utah',
    zip_code: '84601',
    latitude: 40.2338,
    longitude: -111.6585,
    space_type: 'parking_lot',
    size_sqft: 1500,
    price_per_day: 150.00,
    price_per_month: 3500.00,
    instant_book: true,
    allowed_usage_types: ['food_truck', 'mobile_vendor', 'pop_up_shop'],
    operating_hours: 'Monday-Saturday 7AM-10PM, Sunday 9AM-6PM',
    status: 'active',
    amenities: {
      electricity: true,
      water_access: true,
      restrooms: true,
      parking: true,
      wifi: false,
      high_traffic: true,
      garbage_access: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800' },
      { url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800' }
    ]
  },
  {
    title: 'Shopping Center Corner - High Visibility',
    description: 'Premium corner location at busy shopping center. Perfect for seasonal vendors, artists, or specialty food vendors. Covered area with existing electrical hookups. Thousands of shoppers pass by daily.',
    address: '456 University Avenue',
    city: 'Provo',
    state: 'Utah',
    zip_code: '84602',
    latitude: 40.2444,
    longitude: -111.6492,
    space_type: 'storefront',
    size_sqft: 800,
    price_per_day: 200.00,
    price_per_month: 4500.00,
    instant_book: false,
    allowed_usage_types: ['retail_kiosk', 'seasonal_vendor', 'food_truck'],
    operating_hours: 'Monday-Saturday 9AM-9PM',
    status: 'active',
    amenities: {
      electricity: true,
      water_access: false,
      restrooms: true,
      parking: true,
      wifi: true,
      covered: true,
      high_traffic: true,
      security_camera: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800' },
      { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' }
    ]
  },
  {
    title: 'Weekend Farmers Market Space',
    description: 'Join our thriving weekend farmers market! 10x10 booth space perfect for artisans, bakers, farmers, and crafters. Includes table and tent setup. Great community atmosphere with regular customers.',
    address: '789 Center Street',
    city: 'Orem',
    state: 'Utah',
    zip_code: '84057',
    latitude: 40.2969,
    longitude: -111.6946,
    space_type: 'outdoor',
    size_sqft: 100,
    price_per_day: 75.00,
    price_per_month: 1200.00,
    instant_book: true,
    allowed_usage_types: ['farmers_market', 'artisan_booth'],
    operating_hours: 'Saturday-Sunday 8AM-2PM',
    status: 'active',
    amenities: {
      electricity: true,
      water_access: true,
      restrooms: true,
      parking: true,
      covered: true,
      high_traffic: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800' }
    ]
  },
  {
    title: 'Food Truck Park - Evening Events',
    description: 'Join our popular food truck park! Evening spot (4PM-10PM) with established customer base. Full hookups including water, power, and waste disposal. Part of weekly food truck events with live music.',
    address: '321 State Street',
    city: 'Provo',
    state: 'Utah',
    zip_code: '84601',
    latitude: 40.2380,
    longitude: -111.6563,
    space_type: 'parking_lot',
    size_sqft: 400,
    price_per_day: 125.00,
    price_per_month: 2800.00,
    instant_book: false,
    allowed_usage_types: ['food_truck'],
    operating_hours: 'Wednesday-Saturday 4PM-10PM',
    insurance_requirements: 'General liability insurance required ($1M minimum)',
    status: 'active',
    amenities: {
      electricity: true,
      water_access: true,
      restrooms: true,
      parking: true,
      wifi: false,
      garbage_access: true,
      water_dump: true,
      high_traffic: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800' },
      { url: 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?w=800' }
    ]
  },
  {
    title: 'Large Vacant Lot - Flexible Use',
    description: 'Spacious lot perfect for weekend pop-up markets, vintage sales, or mobile vendor events. Paved surface with easy access. Flexible terms and willing to work with creative vendors. Great for testing new business concepts!',
    address: '555 Freedom Boulevard',
    city: 'Provo',
    state: 'Utah',
    zip_code: '84604',
    latitude: 40.2518,
    longitude: -111.6370,
    space_type: 'vacant_lot',
    size_sqft: 3000,
    price_per_day: 100.00,
    price_per_month: 2000.00,
    instant_book: true,
    allowed_usage_types: ['pop_up_shop', 'mobile_vendor', 'farmers_market', 'seasonal_vendor'],
    operating_hours: 'Flexible - discuss with owner',
    additional_terms: 'Minimum 2-day rental on weekends. Monthly rentals include storage options.',
    status: 'active',
    amenities: {
      electricity: true,
      parking: true,
      high_traffic: false
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1567449303183-434f3b7e5995?w=800' }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the first user to use as owner
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No users found in database. Please create a user first.' },
        { status: 404 }
      );
    }

    const ownerId = users[0].id;
    const results = [];
    let successCount = 0;

    for (const spaceData of sampleSpaces) {
      try {
        // Check if space already exists
        const { data: existing } = await supabase
          .from('spaces')
          .select('id')
          .eq('title', spaceData.title)
          .single();

        if (existing) {
          results.push({ space: spaceData.title, status: 'skipped', reason: 'already exists' });
          continue;
        }

        // Create space
        const { data: space, error: spaceError } = await supabase
          .from('spaces')
          .insert({
            owner_id: ownerId,
            title: spaceData.title,
            description: spaceData.description,
            address: spaceData.address,
            city: spaceData.city,
            state: spaceData.state,
            zip_code: spaceData.zip_code,
            latitude: spaceData.latitude,
            longitude: spaceData.longitude,
            space_type: spaceData.space_type,
            size_sqft: spaceData.size_sqft,
            price_per_day: spaceData.price_per_day,
            price_per_month: spaceData.price_per_month,
            instant_book: spaceData.instant_book,
            allowed_usage_types: spaceData.allowed_usage_types,
            operating_hours: spaceData.operating_hours,
            insurance_requirements: spaceData.insurance_requirements,
            additional_terms: spaceData.additional_terms,
            status: spaceData.status
          })
          .select()
          .single();

        if (spaceError) {
          results.push({ space: spaceData.title, status: 'error', error: spaceError.message });
          continue;
        }

        // Create amenities
        if (spaceData.amenities) {
          await supabase
            .from('space_amenities')
            .insert({
              space_id: space.id,
              ...spaceData.amenities
            });
        }

        // Create images
        if (spaceData.images && spaceData.images.length > 0) {
          const imageRecords = spaceData.images.map((img: any, index: number) => ({
            space_id: space.id,
            image_url: img.url,
            is_primary: index === 0,
            display_order: index
          }));

          await supabase
            .from('space_images')
            .insert(imageRecords);
        }

        results.push({ space: spaceData.title, status: 'created', id: space.id });
        successCount++;
      } catch (err: any) {
        results.push({ space: spaceData.title, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${successCount} out of ${sampleSpaces.length} spaces`,
      results,
    });
  } catch (error: any) {
    console.error('Error seeding spaces:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed spaces' },
      { status: 500 }
    );
  }
}
