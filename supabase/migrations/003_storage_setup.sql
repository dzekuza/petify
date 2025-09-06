-- Create storage buckets
INSERT INTO STORAGE.BUCKETS (
    ID,
    NAME,
    PUBLIC,
    FILE_SIZE_LIMIT,
    ALLOWED_MIME_TYPES
) VALUES (
    'avatars',
    'avatars',
    TRUE,
    5242880,
    ARRAY['image/jpeg',
    'image/png',
    'image/webp']
),
(
    'provider-images',
    'provider-images',
    TRUE,
    10485760,
    ARRAY['image/jpeg',
    'image/png',
    'image/webp']
),
(
    'pet-images',
    'pet-images',
    TRUE,
    5242880,
    ARRAY['image/jpeg',
    'image/png',
    'image/webp']
),
(
    'service-images',
    'service-images',
    TRUE,
    10485760,
    ARRAY['image/jpeg',
    'image/png',
    'image/webp']
),
(
    'review-images',
    'review-images',
    TRUE,
    5242880,
    ARRAY['image/jpeg',
    'image/png',
    'image/webp']
),
(
    'documents',
    'documents',
    FALSE,
    20971520,
    ARRAY['application/pdf',
    'image/jpeg',
    'image/png']
),
(
    'messages',
    'messages',
    FALSE,
    10485760,
    ARRAY['image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf']
);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON STORAGE.OBJECTS
    FOR SELECT USING (BUCKET_ID = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON STORAGE.OBJECTS
    FOR INSERT WITH CHECK (
        BUCKET_ID = 'avatars' AND
        AUTH.UID()::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    );

CREATE POLICY "Users can update their own avatar" ON STORAGE.OBJECTS
    FOR UPDATE USING (
        BUCKET_ID = 'avatars' AND
        AUTH.UID()::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON STORAGE.OBJECTS
    FOR DELETE USING (
        BUCKET_ID = 'avatars' AND
        AUTH.UID()::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    );

-- Storage policies for provider-images bucket
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
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
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
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
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
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

-- Storage policies for pet-images bucket
CREATE POLICY "Pet images are publicly accessible" ON STORAGE.OBJECTS
    FOR SELECT USING (BUCKET_ID = 'pet-images');

CREATE POLICY "Pet owners can upload their pet images" ON STORAGE.OBJECTS
    FOR INSERT WITH CHECK (
        BUCKET_ID = 'pet-images' AND
        AUTH.UID() IN (
    SELECT
         OWNER_ID
    FROM
         PUBLIC.PETS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

CREATE POLICY "Pet owners can update their pet images" ON STORAGE.OBJECTS
    FOR UPDATE USING (
        BUCKET_ID = 'pet-images' AND
        AUTH.UID() IN (
    SELECT
         OWNER_ID
    FROM
         PUBLIC.PETS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

CREATE POLICY "Pet owners can delete their pet images" ON STORAGE.OBJECTS
    FOR DELETE USING (
        BUCKET_ID = 'pet-images' AND
        AUTH.UID() IN (
    SELECT
         OWNER_ID
    FROM
         PUBLIC.PETS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

-- Storage policies for service-images bucket
CREATE POLICY "Service images are publicly accessible" ON STORAGE.OBJECTS
    FOR SELECT USING (BUCKET_ID = 'service-images');

CREATE POLICY "Providers can upload service images" ON STORAGE.OBJECTS
    FOR INSERT WITH CHECK (
        BUCKET_ID = 'service-images' AND
        AUTH.UID() IN (
    SELECT
         P.USER_ID
    FROM
         PUBLIC.SERVICES S
        JOIN PUBLIC.PROVIDERS P
        ON P.ID = S.PROVIDER_ID
    WHERE
         S.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

CREATE POLICY "Providers can update service images" ON STORAGE.OBJECTS
    FOR UPDATE USING (
        BUCKET_ID = 'service-images' AND
        AUTH.UID() IN (
    SELECT
         P.USER_ID
    FROM
         PUBLIC.SERVICES S
        JOIN PUBLIC.PROVIDERS P
        ON P.ID = S.PROVIDER_ID
    WHERE
         S.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

CREATE POLICY "Providers can delete service images" ON STORAGE.OBJECTS
    FOR DELETE USING (
        BUCKET_ID = 'service-images' AND
        AUTH.UID() IN (
    SELECT
         P.USER_ID
    FROM
         PUBLIC.SERVICES S
        JOIN PUBLIC.PROVIDERS P
        ON P.ID = S.PROVIDER_ID
    WHERE
         S.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

-- Storage policies for review-images bucket
CREATE POLICY "Review images are publicly accessible" ON STORAGE.OBJECTS
    FOR SELECT USING (BUCKET_ID = 'review-images');

CREATE POLICY "Review authors can upload review images" ON STORAGE.OBJECTS
    FOR INSERT WITH CHECK (
        BUCKET_ID = 'review-images' AND
        AUTH.UID() IN (
    SELECT
         CUSTOMER_ID
    FROM
         PUBLIC.REVIEWS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

CREATE POLICY "Review authors can update review images" ON STORAGE.OBJECTS
    FOR UPDATE USING (
        BUCKET_ID = 'review-images' AND
        AUTH.UID() IN (
    SELECT
         CUSTOMER_ID
    FROM
         PUBLIC.REVIEWS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

CREATE POLICY "Review authors can delete review images" ON STORAGE.OBJECTS
    FOR DELETE USING (
        BUCKET_ID = 'review-images' AND
        AUTH.UID() IN (
    SELECT
         CUSTOMER_ID
    FROM
         PUBLIC.REVIEWS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

-- Storage policies for documents bucket (private)
CREATE POLICY "Users can view their own documents" ON STORAGE.OBJECTS
    FOR SELECT USING (
        BUCKET_ID = 'documents' AND
        AUTH.UID()::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    );

CREATE POLICY "Users can upload their own documents" ON STORAGE.OBJECTS
    FOR INSERT WITH CHECK (
        BUCKET_ID = 'documents' AND
        AUTH.UID()::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    );

CREATE POLICY "Users can update their own documents" ON STORAGE.OBJECTS
    FOR UPDATE USING (
        BUCKET_ID = 'documents' AND
        AUTH.UID()::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    );

CREATE POLICY "Users can delete their own documents" ON STORAGE.OBJECTS
    FOR DELETE USING (
        BUCKET_ID = 'documents' AND
        AUTH.UID()::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    );

-- Storage policies for messages bucket (private)
CREATE POLICY "Users can view messages they're part of" ON STORAGE.OBJECTS
    FOR SELECT USING (
        BUCKET_ID = 'messages' AND
        AUTH.UID() IN (
    SELECT
         CUSTOMER_ID
    FROM
         PUBLIC.CONVERSATIONS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    UNION
    SELECT
         P.USER_ID
    FROM
         PUBLIC.CONVERSATIONS C
        JOIN PUBLIC.PROVIDERS P
        ON P.ID = C.PROVIDER_ID
    WHERE
         C.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

CREATE POLICY "Users can upload messages they're part of" ON STORAGE.OBJECTS
    FOR INSERT WITH CHECK (
        BUCKET_ID = 'messages' AND
        AUTH.UID() IN (
    SELECT
         CUSTOMER_ID
    FROM
         PUBLIC.CONVERSATIONS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    UNION
    SELECT
         P.USER_ID
    FROM
         PUBLIC.CONVERSATIONS C
        JOIN PUBLIC.PROVIDERS P
        ON P.ID = C.PROVIDER_ID
    WHERE
         C.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

CREATE POLICY "Users can update messages they're part of" ON STORAGE.OBJECTS
    FOR UPDATE USING (
        BUCKET_ID = 'messages' AND
        AUTH.UID() IN (
    SELECT
         CUSTOMER_ID
    FROM
         PUBLIC.CONVERSATIONS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    UNION
    SELECT
         P.USER_ID
    FROM
         PUBLIC.CONVERSATIONS C
        JOIN PUBLIC.PROVIDERS P
        ON P.ID = C.PROVIDER_ID
    WHERE
         C.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );

CREATE POLICY "Users can delete messages they're part of" ON STORAGE.OBJECTS
    FOR DELETE USING (
        BUCKET_ID = 'messages' AND
        AUTH.UID() IN (
    SELECT
         CUSTOMER_ID
    FROM
         PUBLIC.CONVERSATIONS
    WHERE
         ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    UNION
    SELECT
         P.USER_ID
    FROM
         PUBLIC.CONVERSATIONS C
        JOIN PUBLIC.PROVIDERS P
        ON P.ID = C.PROVIDER_ID
    WHERE
         C.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
    );