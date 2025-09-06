-- Create storage buckets for images and assets
-- This migration creates the necessary storage buckets for the application

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for general assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage buckets

-- Policy for profile-images bucket - authenticated users can upload their own images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for profile-images bucket - public read access
CREATE POLICY "Profile images are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Policy for profile-images bucket - users can update their own images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for profile-images bucket - users can delete their own images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for service-images bucket - authenticated users can upload service images
CREATE POLICY "Users can upload service images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for service-images bucket - public read access
CREATE POLICY "Service images are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'service-images');

-- Policy for service-images bucket - users can update service images
CREATE POLICY "Users can update service images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for service-images bucket - users can delete service images
CREATE POLICY "Users can delete service images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

-- Policy for assets bucket - authenticated users can upload assets
CREATE POLICY "Users can upload assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'assets' 
  AND auth.role() = 'authenticated'
);

-- Policy for assets bucket - public read access
CREATE POLICY "Assets are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'assets');

-- Policy for assets bucket - users can update assets
CREATE POLICY "Users can update assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'assets' 
  AND auth.role() = 'authenticated'
);

-- Policy for assets bucket - users can delete assets
CREATE POLICY "Users can delete assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'assets' 
  AND auth.role() = 'authenticated'
);
