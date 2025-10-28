# Image Upload Feature for Landlords

## Overview
Landlords can now upload images directly from their camera roll or files when listing a space!

## Features Implemented

### 1. ImageUpload Component
**Location:** `components/ImageUpload.tsx`

**Features:**
- **Drag & Drop**: Drag images directly into the upload area
- **Click to Upload**: Click to browse and select files from device
- **Multiple Images**: Upload up to 10 images per space
- **Image Preview**: See thumbnails of all uploaded images
- **Reorder Images**: Move images left/right to change order
- **Set Primary Image**: Choose which image appears first in listings
- **Remove Images**: Delete unwanted images
- **File Validation**:
  - Only accepts image files (PNG, JPG, GIF, etc.)
  - Maximum file size: 5MB per image
- **Visual Indicators**:
  - "Primary" badge on the main image
  - Image number displayed on each thumbnail
  - Hover effects to reveal controls

### 2. Upload API Endpoint
**Location:** `app/api/upload/route.ts`

**Features:**
- Uploads images to Supabase storage
- Generates unique filenames to prevent conflicts
- Returns public URL for each uploaded image
- Validates file type and size
- DELETE endpoint to remove images if needed

### 3. Updated List Space Page
**Location:** `app/list-space/page.tsx`

**Changes:**
- Replaced URL input fields with ImageUpload component
- Automatically uploads images when form is submitted
- Images are uploaded to Supabase storage before creating the space listing

## How to Use

### For Landlords:

1. **Navigate to List a Space**
   - Go to `/list-space` page
   - Fill out the basic information

2. **Upload Images**
   - Scroll to the "Photos" section
   - **Option 1**: Click the upload area and select images from your device
   - **Option 2**: Drag and drop images directly into the upload area
   - You can upload up to 10 images

3. **Manage Images**
   - **Reorder**: Click the left/right arrows on image thumbnails to reorder
   - **Set Primary**: Hover over an image and click "Set as Primary"
   - **Delete**: Hover over an image and click the red X button
   - The first image will be shown as the main photo in listings

4. **Submit Listing**
   - Complete the rest of the form
   - Click "Create Listing"
   - Images will be automatically uploaded to Supabase storage
   - Your space will be created with all the uploaded images

## Technical Details

### Storage Setup

Images are stored in Supabase Storage in the `space-images` bucket. Make sure this bucket is created in your Supabase project:

1. Go to Supabase Dashboard → Storage
2. Create a bucket named `space-images`
3. Make it public (or configure RLS policies as needed)

### File Naming

Uploaded files are automatically renamed using this pattern:
```
{timestamp}-{randomString}.{originalExtension}
```

Example: `1698765432-abc123.jpg`

This prevents filename conflicts and makes files unique.

### Image Flow

1. User selects images → Preview shown immediately
2. Form submitted → Images uploaded to Supabase one by one
3. Public URLs received → Saved with space listing
4. Space created with image URLs in database

## Browser Support

Works on all modern browsers that support:
- File API
- Drag and Drop API
- FormData

**Mobile Support:**
- iOS: Opens camera roll/photo library
- Android: Opens gallery/camera
- Desktop: Opens file browser

## Testing

To test the image upload feature:

1. Visit `/list-space`
2. Try dragging an image file into the upload area
3. Try clicking to select multiple images
4. Test reordering, setting primary, and removing images
5. Submit the form and verify images appear on the space detail page

## Future Enhancements

Potential improvements:
- Image cropping/editing before upload
- Bulk upload with progress indicator
- Image compression before upload
- Direct camera capture on mobile
- Automatic thumbnail generation
- Image tags/captions

---

**Image upload feature is now live and ready to use!** 📸
