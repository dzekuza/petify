-- Insert sample reviews for BookitNow.lt grooming providers
-- This adds realistic reviews to make the providers look more authentic

-- Vanilos salonas reviews (5.0 rating with 2 reviews)
INSERT INTO PUBLIC.REVIEWS (
    ID,
    PROVIDER_ID,
    CUSTOMER_ID,
    RATING,
    COMMENT,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'vanilos-review-1-id',
    'vanilos-salonas-id',
    'customer-1-id', -- You'll need to create a sample customer
    5,
    'Puikus salonas! Mano šuo buvo labai patenkintas. Profesionalūs kirpėjai, švarus salonas. Tikrai rekomenduoju!',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
),
(
    'vanilos-review-2-id',
    'vanilos-salonas-id',
    'customer-2-id', -- You'll need to create a sample customer
    5,
    'Labai geros paslaugos. Mano katė buvo rami ir patenkinta. Kainos prieinamos, kokybė puiki.',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
) ON CONFLICT (
    ID
) DO NOTHING;

-- OH MY DOG reviews
INSERT INTO PUBLIC.REVIEWS (
    ID,
    PROVIDER_ID,
    CUSTOMER_ID,
    RATING,
    COMMENT,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'oh-my-dog-review-1-id',
    'oh-my-dog-id',
    'customer-3-id',
    4,
    'Geras salonas, profesionalūs darbuotojai. Mano šuo atrodė puikiai po kirpimo.',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
),
(
    'oh-my-dog-review-2-id',
    'oh-my-dog-id',
    'customer-4-id',
    5,
    'Puikūs specialistai! Mano šuo buvo labai ramus. Rekomenduoju visiems.',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
) ON CONFLICT (
    ID
) DO NOTHING;

-- Zoohotel Pavilnys reviews
INSERT INTO PUBLIC.REVIEWS (
    ID,
    PROVIDER_ID,
    CUSTOMER_ID,
    RATING,
    COMMENT,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'zoohotel-pavilnys-review-1-id',
    'zoohotel-pavilnys-id',
    'customer-5-id',
    5,
    'Labai patenkintas paslaugomis. Profesionalūs kirpėjai, švarus salonas.',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days'
),
(
    'zoohotel-pavilnys-review-2-id',
    'zoohotel-pavilnys-id',
    'customer-6-id',
    4,
    'Geros paslaugos už prieinamą kainą. Mano augintinis atrodė puikiai.',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days'
) ON CONFLICT (
    ID
) DO NOTHING;

-- Zoohotel Naujoji Vilnia reviews
INSERT INTO PUBLIC.REVIEWS (
    ID,
    PROVIDER_ID,
    CUSTOMER_ID,
    RATING,
    COMMENT,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'zoohotel-naujoji-review-1-id',
    'zoohotel-naujoji-id',
    'customer-7-id',
    5,
    'Puikus salonas Naujojoje Vilnioje! Profesionalūs specialistai, aukšta kokybė.',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days'
),
(
    'zoohotel-naujoji-review-2-id',
    'zoohotel-naujoji-id',
    'customer-8-id',
    4,
    'Labai geros paslaugos. Mano šuo buvo patenkintas. Rekomenduoju!',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
) ON CONFLICT (
    ID
) DO NOTHING;

-- Zoohotel Lazdynai reviews
INSERT INTO PUBLIC.REVIEWS (
    ID,
    PROVIDER_ID,
    CUSTOMER_ID,
    RATING,
    COMMENT,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'zoohotel-lazdynai-review-1-id',
    'zoohotel-lazdynai-id',
    'customer-9-id',
    5,
    'Puikus salonas Lazdynuose! Profesionalūs kirpėjai, švarus salonas.',
    NOW() - INTERVAL '22 days',
    NOW() - INTERVAL '22 days'
),
(
    'zoohotel-lazdynai-review-2-id',
    'zoohotel-lazdynai-id',
    'customer-10-id',
    4,
    'Geros paslaugos už prieinamą kainą. Mano augintinis atrodė puikiai.',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
) ON CONFLICT (
    ID
) DO NOTHING;

-- Keturkojų Stilius reviews
INSERT INTO PUBLIC.REVIEWS (
    ID,
    PROVIDER_ID,
    CUSTOMER_ID,
    RATING,
    COMMENT,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'keturkoju-review-1-id',
    'keturkoju-stilius-id',
    'customer-11-id',
    5,
    'Puikus salonas Kėdainiuose! Profesionalūs specialistai, aukšta kokybė.',
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '28 days'
),
(
    'keturkoju-review-2-id',
    'keturkoju-stilius-id',
    'customer-12-id',
    4,
    'Labai geros paslaugos. Mano šuo buvo patenkintas. Rekomenduoju!',
    NOW() - INTERVAL '16 days',
    NOW() - INTERVAL '16 days'
) ON CONFLICT (
    ID
) DO NOTHING;

-- Tauro Grooming reviews
INSERT INTO PUBLIC.REVIEWS (
    ID,
    PROVIDER_ID,
    CUSTOMER_ID,
    RATING,
    COMMENT,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'tauro-review-1-id',
    'tauro-grooming-id',
    'customer-13-id',
    5,
    'Puikus salonas! Mokymai buvo labai naudingi. Dabar galiu pati prižiūrėti savo augintinį.',
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '35 days'
),
(
    'tauro-review-2-id',
    'tauro-grooming-id',
    'customer-14-id',
    5,
    'Profesionalūs specialistai! Mokymai padėjo suprasti, kaip tinkamai prižiūrėti augintinį.',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
) ON CONFLICT (
    ID
) DO NOTHING;