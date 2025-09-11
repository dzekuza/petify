-- Insert BookitNow.lt training providers into PetiFy database
-- This script adds real training centers from Lithuania

-- First, let's create some sample users for these providers
-- (In production, these would be real user accounts)

-- Insert users for training providers
INSERT INTO AUTH.USERS (
    ID,
    EMAIL,
    ENCRYPTED_PASSWORD,
    EMAIL_CONFIRMED_AT,
    CREATED_AT,
    UPDATED_AT,
    RAW_APP_META_DATA,
    RAW_USER_META_DATA,
    IS_SUPER_ADMIN,
    ROLE,
    AUD,
    INSTANCE_ID
) VALUES (
    'dresuros-centras-nemirseta-user-id',
    'dresuros.nemirseta@example.com',
    CRYPT('password123', GEN_SALT('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Dresūros centras | Nemirseta"}',
    FALSE,
    'provider',
    'authenticated',
    '00000000-0000-0000-0000-000000000000'
),
(
    'dresuros-centras-palanga-user-id',
    'dresuros.palanga@example.com',
    CRYPT('password123', GEN_SALT('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Dresūros centras | Palanga"}',
    FALSE,
    'provider',
    'authenticated',
    '00000000-0000-0000-0000-000000000000'
),
(
    'fracco-dresuros-mokykla-user-id',
    'fracco.dresura@example.com',
    CRYPT('password123', GEN_SALT('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Fracco dresūros mokykla"}',
    FALSE,
    'provider',
    'authenticated',
    '00000000-0000-0000-0000-000000000000'
),
(
    'reksas-sunu-pamokos-user-id',
    'reksas.pamokos@example.com',
    CRYPT('password123', GEN_SALT('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Reksas - Šunų pamokos Vilniuje"}',
    FALSE,
    'provider',
    'authenticated',
    '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (
    ID
) DO NOTHING;

-- Insert training providers
INSERT INTO PUBLIC.PROVIDERS (
    ID,
    USER_ID,
    BUSINESS_NAME,
    BUSINESS_TYPE,
    DESCRIPTION,
    LOCATION,
    PRICE_RANGE,
    AVAILABILITY,
    IMAGES,
    CERTIFICATIONS,
    EXPERIENCE_YEARS,
    STATUS,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'dresuros-centras-nemirseta-id',
    'dresuros-centras-nemirseta-user-id',
    'Dresūros centras | Nemirseta',
    'training',
    'Profesionalus gyvūnų dresūros centras Nemirsetoje. Teikiame aukštos kokybės dresūros paslaugas šunims ir jų šeimininkams. Mūsų specialistai padės jums išauklėti paklusnų ir laimingą augintinį.',
    '{"address": "Klaipėdos pl. 33", "city": "Nemirseta", "state": "Klaipėdos apskritis", "zip": "LT-91100", "coordinates": {"lat": 55.9042, "lng": 21.0906}}',
    '{"min": 50, "max": 50}',
    '{"monday": [{"start": "09:00", "end": "18:00"}], "tuesday": [{"start": "09:00", "end": "18:00"}], "wednesday": [{"start": "09:00", "end": "18:00"}], "thursday": [{"start": "09:00", "end": "18:00"}], "friday": [{"start": "09:00", "end": "18:00"}], "saturday": [{"start": "10:00", "end": "16:00"}], "sunday": []}',
    '["https://assets.bookitnow.lt/files/uploaded/shops/6bf3b2ad370249f09be2d28f481076be.jpeg"]',
    '["Profesionalus dresūros treneris", "Gyvūnų elgesio specialistas", "Šunų auklėjimo sertifikatas"]',
    8,
    'active',
    NOW(),
    NOW()
),
(
    'dresuros-centras-palanga-id',
    'dresuros-centras-palanga-user-id',
    'Dresūros centras | Palanga',
    'training',
    'Profesionalus gyvūnų dresūros centras Palangoje. Teikiame aukštos kokybės dresūros paslaugas šunims ir jų šeimininkams. Mūsų specialistai padės jums išauklėti paklusnų ir laimingą augintinį.',
    '{"address": "Vytauto g. 58", "city": "Palanga", "state": "Klaipėdos apskritis", "zip": "LT-00135", "coordinates": {"lat": 55.9175, "lng": 21.0686}}',
    '{"min": 50, "max": 50}',
    '{"monday": [{"start": "09:00", "end": "18:00"}], "tuesday": [{"start": "09:00", "end": "18:00"}], "wednesday": [{"start": "09:00", "end": "18:00"}], "thursday": [{"start": "09:00", "end": "18:00"}], "friday": [{"start": "09:00", "end": "18:00"}], "saturday": [{"start": "10:00", "end": "16:00"}], "sunday": []}',
    '["https://assets.bookitnow.lt/files/uploaded/shops/6b27a2830dfd4cc8bdc7f93f4cfdac72.jpeg"]',
    '["Profesionalus dresūros treneris", "Gyvūnų elgesio specialistas", "Šunų auklėjimo sertifikatas"]',
    8,
    'active',
    NOW(),
    NOW()
),
(
    'fracco-dresuros-mokykla-id',
    'fracco-dresuros-mokykla-user-id',
    'Fracco dresūros mokykla',
    'training',
    'Profesionali dresūros mokykla Vilniuje. Teikiame individualias dresūros pamokas, nuotolinius seminarus ir konsultacijas šunų auklėjimo klausimais. Mūsų specialistai padės išspręsti bet kokias elgesio problemas.',
    '{"address": "Brastos g. 89", "city": "Vilnius", "state": "Vilniaus apskritis", "zip": "LT-09109", "coordinates": {"lat": 54.6872, "lng": 25.2797}}',
    '{"min": 15, "max": 30}',
    '{"monday": [{"start": "09:00", "end": "18:00"}], "tuesday": [{"start": "09:00", "end": "18:00"}], "wednesday": [{"start": "09:00", "end": "18:00"}], "thursday": [{"start": "09:00", "end": "18:00"}], "friday": [{"start": "09:00", "end": "18:00"}], "saturday": [{"start": "10:00", "end": "16:00"}], "sunday": []}',
    '["https://assets.bookitnow.lt/files/uploaded/shops/1d4297f38e68448daa4a976d9ca2bcbb.jpeg"]',
    '["Profesionalus dresūros treneris", "Gyvūnų elgesio specialistas", "Šunų auklėjimo sertifikatas", "Nuotolinio mokymo specialistas"]',
    10,
    'active',
    NOW(),
    NOW()
),
(
    'reksas-sunu-pamokos-id',
    'reksas-sunu-pamokos-user-id',
    'Reksas - Šunų pamokos Vilniuje',
    'training',
    'Profesionalus šunų dresūros specialistas Vilniuje. Teikiame individualias konsultacijas dėl šunų elgesio, jaunų šuniukų auklėjimo pamokas ir elgesio problemų sprendimo paslaugas.',
    '{"address": "Daugėliškio g. 32a", "city": "Vilnius", "state": "Vilniaus apskritis", "zip": "LT-09109", "coordinates": {"lat": 54.6872, "lng": 25.2797}}',
    '{"min": 50, "max": 60}',
    '{"monday": [{"start": "09:00", "end": "18:00"}], "tuesday": [{"start": "09:00", "end": "18:00"}], "wednesday": [{"start": "09:00", "end": "18:00"}], "thursday": [{"start": "09:00", "end": "18:00"}], "friday": [{"start": "09:00", "end": "18:00"}], "saturday": [{"start": "10:00", "end": "16:00"}], "sunday": []}',
    '["https://assets.bookitnow.lt/files/uploaded/shops/ea0cd16aad7247d384784b57541b4bce.jpeg"]',
    '["Profesionalus dresūros treneris", "Gyvūnų elgesio specialistas", "Šunų auklėjimo sertifikatas", "Elgesio problemų sprendimo specialistas"]',
    12,
    'active',
    NOW(),
    NOW()
) ON CONFLICT (
    ID
) DO NOTHING;