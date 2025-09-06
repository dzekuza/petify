-- Insert sample users (these would normally be created through Supabase Auth)
-- Note: In production, users are created through the auth system

-- Insert sample providers
INSERT INTO PUBLIC.PROVIDERS (
    USER_ID,
    BUSINESS_NAME,
    BUSINESS_TYPE,
    DESCRIPTION,
    SERVICES,
    LOCATION,
    CONTACT_INFO,
    BUSINESS_HOURS,
    PRICE_RANGE,
    AVAILABILITY,
    IMAGES,
    CERTIFICATIONS,
    EXPERIENCE_YEARS,
    STATUS,
    IS_VERIFIED
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- This would be a real user ID from auth
    'Happy Paws Grooming',
    'individual',
    'Professional pet grooming with 10+ years of experience. Specializing in dogs and cats.',
    ARRAY['grooming']::SERVICE_CATEGORY[],
    '{"address": "123 Main St", "city": "San Francisco", "state": "CA", "zip": "94102", "coordinates": {"lat": 37.7749, "lng": -122.4194}}',
    '{"phone": "+1-555-0123", "email": "contact@happypaws.com", "website": "https://happypaws.com"}',
    '{"monday": {"start": "09:00", "end": "17:00", "available": true}, "tuesday": {"start": "09:00", "end": "17:00", "available": true}, "wednesday": {"start": "09:00", "end": "17:00", "available": true}, "thursday": {"start": "09:00", "end": "17:00", "available": true}, "friday": {"start": "09:00", "end": "17:00", "available": true}, "saturday": {"start": "10:00", "end": "16:00", "available": true}, "sunday": {"start": null, "end": null, "available": false}}',
    '{"min": 45, "max": 85, "currency": "USD"}',
    '{"monday": [{"start": "09:00", "end": "17:00", "available": true}], "tuesday": [{"start": "09:00", "end": "17:00", "available": true}], "wednesday": [{"start": "09:00", "end": "17:00", "available": true}], "thursday": [{"start": "09:00", "end": "17:00", "available": true}], "friday": [{"start": "09:00", "end": "17:00", "available": true}], "saturday": [{"start": "10:00", "end": "16:00", "available": true}], "sunday": []}',
    ARRAY['https://example.com/grooming1.jpg',
    'https://example.com/grooming2.jpg'],
    ARRAY['Certified Pet Groomer',
    'CPDT-KA'],
    10,
    'active',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000002',
    'Dr. Sarah''s Veterinary Clinic',
    'clinic',
    'Comprehensive veterinary care for all pets. 24/7 emergency services available.',
    ARRAY['veterinary']::SERVICE_CATEGORY[],
    '{"address": "456 Oak Ave", "city": "San Francisco", "state": "CA", "zip": "94103", "coordinates": {"lat": 37.7849, "lng": -122.4094}}',
    '{"phone": "+1-555-0124", "email": "info@drsarahvet.com", "website": "https://drsarahvet.com"}',
    '{"monday": {"start": "08:00", "end": "18:00", "available": true}, "tuesday": {"start": "08:00", "end": "18:00", "available": true}, "wednesday": {"start": "08:00", "end": "18:00", "available": true}, "thursday": {"start": "08:00", "end": "18:00", "available": true}, "friday": {"start": "08:00", "end": "18:00", "available": true}, "saturday": {"start": "09:00", "end": "15:00", "available": true}, "sunday": {"start": null, "end": null, "available": false}}',
    '{"min": 75, "max": 200, "currency": "USD"}',
    '{"monday": [{"start": "08:00", "end": "18:00", "available": true}], "tuesday": [{"start": "08:00", "end": "18:00", "available": true}], "wednesday": [{"start": "08:00", "end": "18:00", "available": true}], "thursday": [{"start": "08:00", "end": "18:00", "available": true}], "friday": [{"start": "08:00", "end": "18:00", "available": true}], "saturday": [{"start": "09:00", "end": "15:00", "available": true}], "sunday": []}',
    ARRAY['https://example.com/vet1.jpg',
    'https://example.com/vet2.jpg'],
    ARRAY['DVM',
    'Emergency Medicine Certified'],
    15,
    'active',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000003',
    'Paws & Play Boarding',
    'business',
    'Luxury pet boarding with 24/7 care. Indoor and outdoor play areas.',
    ARRAY['boarding']::SERVICE_CATEGORY[],
    '{"address": "789 Pine St", "city": "San Francisco", "state": "CA", "zip": "94104", "coordinates": {"lat": 37.7949, "lng": -122.3994}}',
    '{"phone": "+1-555-0125", "email": "book@pawsplay.com", "website": "https://pawsplay.com"}',
    '{"monday": {"start": "00:00", "end": "23:59", "available": true}, "tuesday": {"start": "00:00", "end": "23:59", "available": true}, "wednesday": {"start": "00:00", "end": "23:59", "available": true}, "thursday": {"start": "00:00", "end": "23:59", "available": true}, "friday": {"start": "00:00", "end": "23:59", "available": true}, "saturday": {"start": "00:00", "end": "23:59", "available": true}, "sunday": {"start": "00:00", "end": "23:59", "available": true}}',
    '{"min": 60, "max": 120, "currency": "USD"}',
    '{"monday": [{"start": "00:00", "end": "23:59", "available": true}], "tuesday": [{"start": "00:00", "end": "23:59", "available": true}], "wednesday": [{"start": "00:00", "end": "23:59", "available": true}], "thursday": [{"start": "00:00", "end": "23:59", "available": true}], "friday": [{"start": "00:00", "end": "23:59", "available": true}], "saturday": [{"start": "00:00", "end": "23:59", "available": true}], "sunday": [{"start": "00:00", "end": "23:59", "available": true}]}',
    ARRAY['https://example.com/boarding1.jpg',
    'https://example.com/boarding2.jpg'],
    ARRAY['Pet Care Certified',
    'Animal Behavior Certified'],
    8,
    'active',
    TRUE
);

-- Insert sample services
INSERT INTO PUBLIC.SERVICES (
    PROVIDER_ID,
    NAME,
    CATEGORY,
    DESCRIPTION,
    PRICE,
    DURATION_MINUTES,
    MAX_PETS,
    REQUIREMENTS,
    INCLUDES,
    IMAGES
) VALUES (
    (SELECT ID FROM PUBLIC.PROVIDERS WHERE BUSINESS_NAME = 'Happy Paws Grooming'),
    'Full Grooming Package',
    'grooming',
    'Complete grooming service including bath, brush, nail trim, and styling.',
    65.00,
    120,
    1,
    ARRAY['Vaccination records required',
    'Pet must be healthy'],
    ARRAY['Bath and blow dry',
    'Brushing and de-matting',
    'Nail trimming',
    'Ear cleaning',
    'Styling'],
    ARRAY['https://example.com/service1.jpg']
),
(
    (SELECT ID FROM PUBLIC.PROVIDERS WHERE BUSINESS_NAME = 'Dr. Sarah''s Veterinary Clinic'),
    'Annual Health Checkup',
    'veterinary',
    'Comprehensive annual health examination for your pet.',
    125.00,
    45,
    1,
    ARRAY['Vaccination records',
    'Previous medical history'],
    ARRAY['Physical examination',
    'Vaccination updates',
    'Health recommendations',
    'Medical records update'],
    ARRAY['https://example.com/service2.jpg']
),
(
    (SELECT ID FROM PUBLIC.PROVIDERS WHERE BUSINESS_NAME = 'Paws & Play Boarding'),
    'Overnight Boarding',
    'boarding',
    'Comfortable overnight stay with daily walks and playtime.',
    80.00,
    1440, -- 24 hours
    1,
    ARRAY['Vaccination records',
    'Emergency contact information'],
    ARRAY['Comfortable sleeping area',
    'Daily walks',
    'Playtime',
    'Feeding',
    'Medication administration'],
    ARRAY['https://example.com/service3.jpg']
);

-- Update provider ratings with sample data
UPDATE PUBLIC.PROVIDERS
SET
    RATING = 4.9,
    REVIEW_COUNT = 127
WHERE
    BUSINESS_NAME = 'Happy Paws Grooming';

UPDATE PUBLIC.PROVIDERS
SET
    RATING = 4.8,
    REVIEW_COUNT = 89
WHERE
    BUSINESS_NAME = 'Dr. Sarah''s Veterinary Clinic';

UPDATE PUBLIC.PROVIDERS
SET
    RATING = 4.7,
    REVIEW_COUNT = 156
WHERE
    BUSINESS_NAME = 'Paws & Play Boarding';

-- Insert sample reviews
INSERT INTO PUBLIC.REVIEWS (
    CUSTOMER_ID,
    PROVIDER_ID,
    RATING,
    TITLE,
    COMMENT,
    IS_PUBLIC
) VALUES (
    '00000000-0000-0000-0000-000000000010', -- Sample customer ID
    (SELECT ID FROM PUBLIC.PROVIDERS WHERE BUSINESS_NAME = 'Happy Paws Grooming'),
    5,
    'Excellent grooming service!',
    'My dog came back looking and smelling amazing. The staff was very professional and caring.',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000011',
    (SELECT ID FROM PUBLIC.PROVIDERS WHERE BUSINESS_NAME = 'Dr. Sarah''s Veterinary Clinic'),
    5,
    'Great veterinary care',
    'Dr. Sarah is wonderful with animals. She explained everything clearly and made my pet feel comfortable.',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000012',
    (SELECT ID FROM PUBLIC.PROVIDERS WHERE BUSINESS_NAME = 'Paws & Play Boarding'),
    4,
    'Good boarding experience',
    'My cat was well taken care of during our vacation. The facility is clean and the staff is friendly.',
    TRUE
);