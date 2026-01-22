-- Create storage bucket for space images
INSERT INTO storage.buckets (id, name, public)
VALUES ('space-images', 'space-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for space-images bucket
-- Allow anyone to read images (public bucket)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'space-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'space-images'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'space-images'
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own images
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'space-images'
  AND auth.role() = 'authenticated'
);
