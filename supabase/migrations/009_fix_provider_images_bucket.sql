-- Fix provider-images bucket and policies for provider profile images
-- This migration ensures the provider-images bucket exists and has correct policies

-- Create provider-images bucket if it doesn't exist
INSERT INTO STORAGE.BUCKETS (
    ID,
    NAME,
    PUBLIC,
    FILE_SIZE_LIMIT,
    ALLOWED_MIME_TYPES
) VALUES (
    'provider-images',
    'provider-images',
    TRUE,
    10485760, -- 10MB limit
    ARRAY['image/jpeg',
    'image/png',
    'image/webp',
    'image/gif']
) ON CONFLICT (
    ID
) DO NOTHING;

-- Drop existing policies for provider-images bucket if they exist
DROP POLICY IF EXISTS "Provider images are publicly accessible" ON STORAGE.OBJECTS;

DROP POLICY IF EXISTS "Providers can upload their own images" ON STORAGE.OBJECTS;

DROP POLICY IF EXISTS "Providers can update their own images" ON STORAGE.OBJECTS;

DROP POLICY IF EXISTS "Providers can delete their own images" ON STORAGE.OBJECTS;

-- Create new policies for provider-images bucket
CREATE POLICY "Provider images are publicly accessible" ON STORAGE.OBJECTS
    FOR SELECT USING (BUCKET_ID = 'provider-images');

CREATE POLICY "Providers can upload their own images" ON STORAGE.OBJECTS
    FOR INSERT WITH CHECK (
        BUCKET_ID = 'provider-images' AND
        AUTH.UID() IN (
    SELECT
                  USER_ID
    FROM
                  PUBLIC.PROVIDERS
    WHERE
                  ID::TEXT = (STORAGE.FOLDERNAME(NAME))[2]
)
    );

CREATE POLICY "Providers can update their own images" ON STORAGE.OBJECTS
    FOR UPDATE USING (
        BUCKET_ID = 'provider-images' AND
        AUTH.UID() IN (
    SELECT
                  USER_ID
    FROM
                  PUBLIC.PROVIDERS
    WHERE
                  ID::TEXT = (STORAGE.FOLDERNAME(NAME))[2]
)
    );

CREATE POLICY "Providers can delete their own images" ON STORAGE.OBJECTS
    FOR DELETE USING (
        BUCKET_ID = 'provider-images' AND
        AUTH.UID() IN (
    SELECT
                  USER_ID
    FROM
                  PUBLIC.PROVIDERS
    WHERE
                  ID::TEXT = (STORAGE.FOLDERNAME(NAME))[2]
)
    );