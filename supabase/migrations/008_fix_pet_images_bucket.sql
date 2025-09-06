-- Fix pet-images bucket creation
-- This migration ensures the pet-images bucket exists with proper configuration

-- Create storage bucket for pet images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-images',
  'pet-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies for pet-images bucket to avoid conflicts
DROP POLICY IF EXISTS "Pet images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Pet owners can upload their pet images" ON storage.objects;
DROP POLICY IF EXISTS "Pet owners can update their pet images" ON storage.objects;
DROP POLICY IF EXISTS "Pet owners can delete their pet images" ON storage.objects;

-- Create RLS policies for pet-images bucket

-- Policy for pet-images bucket - public read access
CREATE POLICY "Pet images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-images');

-- Policy for pet-images bucket - pet owners can upload their pet images
CREATE POLICY "Pet owners can upload their pet images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-images' 
  AND auth.uid() IN (
    SELECT owner_id
    FROM public.pets
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Policy for pet-images bucket - pet owners can update their pet images
CREATE POLICY "Pet owners can update their pet images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-images' 
  AND auth.uid() IN (
    SELECT owner_id
    FROM public.pets
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Policy for pet-images bucket - pet owners can delete their pet images
CREATE POLICY "Pet owners can delete their pet images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-images' 
  AND auth.uid() IN (
    SELECT owner_id
    FROM public.pets
    WHERE id::text = (storage.foldername(name))[1]
  )
);
