# GoLocal Spaces - Database Schema

## Core Tables

### Users
```sql
users {
  id UUID PRIMARY KEY
  email VARCHAR(255) UNIQUE NOT NULL
  password_hash VARCHAR(255)
  first_name VARCHAR(100)
  last_name VARCHAR(100)
  phone VARCHAR(20)
  user_type ENUM('landlord', 'vendor', 'both')
  profile_image_url TEXT
  verified BOOLEAN DEFAULT false
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
}
```

### Spaces (Property Listings)
```sql
spaces {
  id UUID PRIMARY KEY
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE
  title VARCHAR(255) NOT NULL
  description TEXT
  address TEXT NOT NULL
  city VARCHAR(100) NOT NULL
  state VARCHAR(50) NOT NULL
  zip_code VARCHAR(10) NOT NULL
  latitude DECIMAL(10, 8)
  longitude DECIMAL(11, 8)
  space_type ENUM('parking_lot', 'storefront', 'vacant_land', 'warehouse', 'other')
  size_sqft INTEGER
  price_per_day DECIMAL(10, 2) NOT NULL
  price_per_week DECIMAL(10, 2)
  price_per_month DECIMAL(10, 2)
  instant_book BOOLEAN DEFAULT false
  status ENUM('active', 'inactive', 'pending_verification') DEFAULT 'active'
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
}
```

### Space Amenities
```sql
space_amenities {
  id UUID PRIMARY KEY
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE
  electricity BOOLEAN DEFAULT false
  water_access BOOLEAN DEFAULT false
  restrooms BOOLEAN DEFAULT false
  parking BOOLEAN DEFAULT false
  wifi BOOLEAN DEFAULT false
  storage BOOLEAN DEFAULT false
  security_camera BOOLEAN DEFAULT false
  covered BOOLEAN DEFAULT false
  high_traffic BOOLEAN DEFAULT false
  created_at TIMESTAMP DEFAULT NOW()
}
```

### Space Images
```sql
space_images {
  id UUID PRIMARY KEY
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE
  image_url TEXT NOT NULL
  is_primary BOOLEAN DEFAULT false
  display_order INTEGER DEFAULT 0
  created_at TIMESTAMP DEFAULT NOW()
}
```

### Space Availability
```sql
space_availability {
  id UUID PRIMARY KEY
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE
  available_from DATE NOT NULL
  available_to DATE NOT NULL
  is_blocked BOOLEAN DEFAULT false
  created_at TIMESTAMP DEFAULT NOW()
}
```

### Bookings
```sql
bookings {
  id UUID PRIMARY KEY
  space_id UUID REFERENCES spaces(id)
  vendor_id UUID REFERENCES users(id)
  landlord_id UUID REFERENCES users(id)
  start_date DATE NOT NULL
  end_date DATE NOT NULL
  total_price DECIMAL(10, 2) NOT NULL
  booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'declined') DEFAULT 'pending'
  payment_status ENUM('pending', 'paid', 'refunded', 'partial_refund') DEFAULT 'pending'
  stripe_payment_intent_id VARCHAR(255)
  special_requests TEXT
  cancellation_reason TEXT
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
}
```

### Reviews
```sql
reviews {
  id UUID PRIMARY KEY
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE
  reviewer_id UUID REFERENCES users(id)
  reviewee_id UUID REFERENCES users(id)
  space_id UUID REFERENCES spaces(id)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL
  comment TEXT
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()

  UNIQUE(booking_id, reviewer_id)
}
```

### Messages
```sql
messages {
  id UUID PRIMARY KEY
  sender_id UUID REFERENCES users(id)
  receiver_id UUID REFERENCES users(id)
  booking_id UUID REFERENCES bookings(id)
  message_text TEXT NOT NULL
  is_read BOOLEAN DEFAULT false
  created_at TIMESTAMP DEFAULT NOW()
}
```

### Notifications
```sql
notifications {
  id UUID PRIMARY KEY
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
  notification_type ENUM('booking_request', 'booking_confirmed', 'booking_cancelled', 'new_message', 'review_received', 'payment_received')
  title VARCHAR(255) NOT NULL
  message TEXT NOT NULL
  related_id UUID
  is_read BOOLEAN DEFAULT false
  created_at TIMESTAMP DEFAULT NOW()
}
```

### Favorites
```sql
favorites {
  id UUID PRIMARY KEY
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE
  created_at TIMESTAMP DEFAULT NOW()

  UNIQUE(user_id, space_id)
}
```

### Transactions
```sql
transactions {
  id UUID PRIMARY KEY
  booking_id UUID REFERENCES bookings(id)
  payer_id UUID REFERENCES users(id)
  payee_id UUID REFERENCES users(id)
  amount DECIMAL(10, 2) NOT NULL
  platform_fee DECIMAL(10, 2) NOT NULL
  stripe_charge_id VARCHAR(255)
  stripe_transfer_id VARCHAR(255)
  transaction_type ENUM('payment', 'refund', 'payout')
  transaction_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending'
  created_at TIMESTAMP DEFAULT NOW()
}
```

### User Verification
```sql
user_verification {
  id UUID PRIMARY KEY
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
  verification_type ENUM('email', 'phone', 'id_document', 'business_license')
  verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
  document_url TEXT
  notes TEXT
  verified_at TIMESTAMP
  created_at TIMESTAMP DEFAULT NOW()
}
```

## Indexes for Performance

```sql
CREATE INDEX idx_spaces_owner ON spaces(owner_id);
CREATE INDEX idx_spaces_location ON spaces(city, state);
CREATE INDEX idx_spaces_lat_lng ON spaces(latitude, longitude);
CREATE INDEX idx_spaces_status ON spaces(status);
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_landlord ON bookings(landlord_id);
CREATE INDEX idx_bookings_space ON bookings(space_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_reviews_space ON reviews(space_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
```

## Key Relationships

1. **Users** can be landlords, vendors, or both
2. **Spaces** belong to landlord users
3. **Bookings** connect vendors with spaces and landlords
4. **Reviews** are bidirectional (vendors review spaces/landlords, landlords review vendors)
5. **Messages** are linked to bookings for context
6. **Transactions** track all financial activity
7. **Space Availability** manages calendar and blocking
8. **Favorites** allow vendors to save preferred spaces

## Data Integrity Rules

- Bookings cannot overlap for the same space
- Users must be verified before hosting or booking
- Reviews can only be created after booking is completed
- Ratings must be between 1-5
- Transactions must match booking amounts
