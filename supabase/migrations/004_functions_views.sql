-- Create function to search providers by location and services
CREATE OR REPLACE FUNCTION PUBLIC.SEARCH_PROVIDERS(
    SEARCH_LAT DECIMAL,
    SEARCH_LNG DECIMAL,
    SEARCH_RADIUS INTEGER DEFAULT 25,
    SERVICE_FILTER SERVICE_CATEGORY DEFAULT NULL,
    MIN_RATING DECIMAL DEFAULT 0,
    LIMIT_COUNT INTEGER DEFAULT 50
) RETURNS TABLE ( ID UUID, BUSINESS_NAME TEXT, DESCRIPTION TEXT, SERVICES SERVICE_CATEGORY[], LOCATION JSONB, RATING DECIMAL, REVIEW_COUNT INTEGER, PRICE_RANGE JSONB, IMAGES TEXT[], DISTANCE_KM DECIMAL ) AS
    $$               BEGIN RETURN QUERY
    SELECT
        P.ID,
        P.BUSINESS_NAME,
        P.DESCRIPTION,
        P.SERVICES,
        P.LOCATION,
        P.RATING,
        P.REVIEW_COUNT,
        P.PRICE_RANGE,
        P.IMAGES,
        ST_DISTANCE( ST_POINT(SEARCH_LNG,
        SEARCH_LAT)::GEOGRAPHY,
        ST_POINT( (P.LOCATION->>'lng')::DECIMAL,
        (P.LOCATION->>'lat')::DECIMAL )::GEOGRAPHY ) / 1000 AS DISTANCE_KM
    FROM
        PUBLIC.PROVIDERS P
    WHERE
        P.STATUS = 'active'
        AND (SERVICE_FILTER IS NULL
        OR SERVICE_FILTER = ANY(P.SERVICES))
        AND P.RATING >= MIN_RATING
        AND ST_DWITHIN( ST_POINT(SEARCH_LNG, SEARCH_LAT)::GEOGRAPHY, ST_POINT( (P.LOCATION->>'lng')::DECIMAL, (P.LOCATION->>'lat')::DECIMAL )::GEOGRAPHY, SEARCH_RADIUS * 1000 )
    ORDER BY
        DISTANCE_KM LIMIT LIMIT_COUNT;
END;
$$               LANGUAGE PLPGSQL SECURITY DEFINER;
 
-- Create function to get provider availability
CREATE           OR REPLACE

FUNCTION PUBLIC.GET_PROVIDER_AVAILABILITY(
    PROVIDER_UUID UUID,
    CHECK_DATE DATE
) RETURNS TABLE ( IS_AVAILABLE BOOLEAN, AVAILABLE_SLOTS JSONB ) AS
    $$               BEGIN RETURN QUERY
    SELECT
        CASE
            WHEN P.AVAILABILITY IS NULL THEN
                TRUE
            ELSE
                (
                P.AVAILABILITY->>(
                    CASE EXTRACT(DOW FROM CHECK_DATE)
                        WHEN 0 THEN
                            'sunday'
                        WHEN 1 THEN
                            'monday'
                        WHEN 2 THEN
                            'tuesday'
                        WHEN 3 THEN
                            'wednesday'
                        WHEN 4 THEN
                            'thursday'
                        WHEN 5 THEN
                            'friday'
                        WHEN 6 THEN
                            'saturday'
                    END
                )
                ) IS NOT NULL
        END AS IS_AVAILABLE,
        P.AVAILABILITY->>(
            CASE EXTRACT(DOW FROM CHECK_DATE)
                WHEN 0 THEN
                    'sunday'
                WHEN 1 THEN
                    'monday'
                WHEN 2 THEN
                    'tuesday'
                WHEN 3 THEN
                    'wednesday'
                WHEN 4 THEN
                    'thursday'
                WHEN 5 THEN
                    'friday'
                WHEN 6 THEN
                    'saturday'
            END ) AS AVAILABLE_SLOTS
    FROM
        PUBLIC.PROVIDERS P
    WHERE
        P.ID = PROVIDER_UUID;
END;
$$               LANGUAGE PLPGSQL SECURITY DEFINER;
 
-- Create function to create booking
CREATE           OR REPLACE

FUNCTION PUBLIC.CREATE_BOOKING(
    P_CUSTOMER_ID UUID,
    P_PROVIDER_ID UUID,
    P_SERVICE_ID UUID,
    P_PET_ID UUID,
    P_BOOKING_DATE DATE,
    P_START_TIME TIME,
    P_END_TIME TIME,
    P_TOTAL_PRICE DECIMAL,
    P_SPECIAL_INSTRUCTIONS TEXT DEFAULT NULL
) RETURNS UUID AS
    $$               DECLARE BOOKING_ID UUID;
    DURATION_MINUTES INTEGER;
BEGIN
 
    -- Calculate duration
    DURATION_MINUTES := EXTRACT(EPOCH FROM (P_END_TIME - P_START_TIME)) / 60;
 
    -- Check if provider is available
    IF NOT EXISTS (
        SELECT
            1
        FROM
            PUBLIC.GET_PROVIDER_AVAILABILITY(P_PROVIDER_ID,
            P_BOOKING_DATE)
        WHERE
            IS_AVAILABLE = TRUE
    ) THEN
        RAISE
    EXCEPTION
        'Provider is not available on this date';
    END IF;
 

    -- Check for conflicts
    IF EXISTS (
        SELECT
            1
        FROM
            PUBLIC.BOOKINGS
        WHERE
            PROVIDER_ID = P_PROVIDER_ID
            AND BOOKING_DATE = P_BOOKING_DATE
            AND ( (START_TIME <= P_START_TIME
            AND END_TIME > P_START_TIME)
            OR (START_TIME < P_END_TIME
            AND END_TIME >= P_END_TIME)
            OR (START_TIME >= P_START_TIME
            AND END_TIME <= P_END_TIME) )
            AND STATUS NOT IN ('cancelled', 'completed')
    ) THEN
        RAISE
    EXCEPTION
        'Time slot is already booked';
    END IF;
 

    -- Create booking
    INSERT INTO PUBLIC.BOOKINGS (
        CUSTOMER_ID,
        PROVIDER_ID,
        SERVICE_ID,
        PET_ID,
        BOOKING_DATE,
        START_TIME,
        END_TIME,
        DURATION_MINUTES,
        TOTAL_PRICE,
        SPECIAL_INSTRUCTIONS,
        STATUS
    ) VALUES (
        P_CUSTOMER_ID,
        P_PROVIDER_ID,
        P_SERVICE_ID,
        P_PET_ID,
        P_BOOKING_DATE,
        P_START_TIME,
        P_END_TIME,
        DURATION_MINUTES,
        P_TOTAL_PRICE,
        P_SPECIAL_INSTRUCTIONS,
        'pending'
    ) RETURNING ID INTO BOOKING_ID;
 
    -- Create notification for provider
    INSERT INTO PUBLIC.NOTIFICATIONS (
        USER_ID,
        TITLE,
        MESSAGE,
        TYPE,
        DATA
    )
        SELECT
            USER_ID,
            'New Booking Request',
            'You have a new booking request for ' || P_BOOKING_DATE,
            'booking',
            JSON_BUILD_OBJECT('booking_id',
            BOOKING_ID,
            'customer_id',
            P_CUSTOMER_ID)
        FROM
            PUBLIC.PROVIDERS
        WHERE
            ID = P_PROVIDER_ID;
    RETURN BOOKING_ID;
END;
SECURITY         DEFINER;
 
-- Create function to get user dashboard data
CREATE           OR REPLACE

FUNCTION PUBLIC.GET_USER_DASHBOARD(
    P_USER_ID UUID
) RETURNS JSON AS
    $$             DECLARE USER_ROLE USER_ROLE;
    DASHBOARD_DATA JSON;
BEGIN
 
    -- Get user role
    SELECT
        ROLE INTO USER_ROLE
    FROM
        PUBLIC.USERS
    WHERE
        ID = P_USER_ID;
    IF USER_ROLE = 'customer' THEN
        SELECT
            JSON_BUILD_OBJECT( 'upcoming_bookings',
            (
                SELECT
                    JSON_AGG( JSON_BUILD_OBJECT( 'id',
                    B.ID,
                    'provider_name',
                    P.BUSINESS_NAME,
                    'service_name',
                    S.NAME,
                    'booking_date',
                    B.BOOKING_DATE,
                    'start_time',
                    B.START_TIME,
                    'end_time',
                    B.END_TIME,
                    'status',
                    B.STATUS,
                    'total_price',
                    B.TOTAL_PRICE ) )
                FROM
                    PUBLIC.BOOKINGS B
                    JOIN PUBLIC.PROVIDERS P
                    ON P.ID = B.PROVIDER_ID
                    LEFT JOIN PUBLIC.SERVICES S
                    ON S.ID = B.SERVICE_ID
                WHERE
                    B.CUSTOMER_ID = P_USER_ID
                    AND B.BOOKING_DATE >= CURRENT_DATE
                    AND B.STATUS IN ('pending', 'confirmed')
                ORDER BY
                    B.BOOKING_DATE,
                    B.START_TIME LIMIT 5
            ),
            'recent_reviews',
            (
                SELECT
                    JSON_AGG( JSON_BUILD_OBJECT( 'id',
                    R.ID,
                    'provider_name',
                    P.BUSINESS_NAME,
                    'rating',
                    R.RATING,
                    'title',
                    R.TITLE,
                    'created_at',
                    R.CREATED_AT ) )
                FROM
                    PUBLIC.REVIEWS R
                    JOIN PUBLIC.PROVIDERS P
                    ON P.ID = R.PROVIDER_ID
                WHERE
                    R.CUSTOMER_ID = P_USER_ID
                ORDER BY
                    R.CREATED_AT DESC LIMIT 3
            ),
            'favorite_providers',
            (
                SELECT
                    JSON_AGG( JSON_BUILD_OBJECT( 'id',
                    P.ID,
                    'business_name',
                    P.BUSINESS_NAME,
                    'rating',
                    P.RATING,
                    'review_count',
                    P.REVIEW_COUNT,
                    'services',
                    P.SERVICES ) )
                FROM
                    PUBLIC.FAVORITES F
                    JOIN PUBLIC.PROVIDERS P
                    ON P.ID = F.PROVIDER_ID
                WHERE
                    F.USER_ID = P_USER_ID LIMIT 5
            ) ) INTO DASHBOARD_DATA;
    ELSIF USER_ROLE = 'provider' THEN
        SELECT
            JSON_BUILD_OBJECT( 'upcoming_bookings',
            (
                SELECT
                    JSON_AGG( JSON_BUILD_OBJECT( 'id',
                    B.ID,
                    'customer_name',
                    U.FULL_NAME,
                    'service_name',
                    S.NAME,
                    'booking_date',
                    B.BOOKING_DATE,
                    'start_time',
                    B.START_TIME,
                    'end_time',
                    B.END_TIME,
                    'status',
                    B.STATUS,
                    'total_price',
                    B.TOTAL_PRICE ) )
                FROM
                    PUBLIC.BOOKINGS B
                    JOIN PUBLIC.USERS U
                    ON U.ID = B.CUSTOMER_ID
                    LEFT JOIN PUBLIC.SERVICES S
                    ON S.ID = B.SERVICE_ID
                    JOIN PUBLIC.PROVIDERS P
                    ON P.ID = B.PROVIDER_ID
                WHERE
                    P.USER_ID = P_USER_ID
                    AND B.BOOKING_DATE >= CURRENT_DATE
                    AND B.STATUS IN ('pending', 'confirmed')
                ORDER BY
                    B.BOOKING_DATE,
                    B.START_TIME LIMIT 5
            ),
            'recent_reviews',
            (
                SELECT
                    JSON_AGG( JSON_BUILD_OBJECT( 'id',
                    R.ID,
                    'customer_name',
                    U.FULL_NAME,
                    'rating',
                    R.RATING,
                    'title',
                    R.TITLE,
                    'comment',
                    R.COMMENT,
                    'created_at',
                    R.CREATED_AT ) )
                FROM
                    PUBLIC.REVIEWS R
                    JOIN PUBLIC.USERS U
                    ON U.ID = R.CUSTOMER_ID
                    JOIN PUBLIC.PROVIDERS P
                    ON P.ID = R.PROVIDER_ID
                WHERE
                    P.USER_ID = P_USER_ID
                ORDER BY
                    R.CREATED_AT DESC LIMIT 3
            ),
            'business_stats',
            (
                SELECT
                    JSON_BUILD_OBJECT( 'total_bookings',
                    COUNT(*),
                    'total_revenue',
                    COALESCE(SUM(TOTAL_PRICE),
                    0),
                    'rating',
                    AVG(RATING),
                    'review_count',
                    COUNT(*) )
                FROM
                    PUBLIC.BOOKINGS B
                    JOIN PUBLIC.PROVIDERS P
                    ON P.ID = B.PROVIDER_ID
                WHERE
                    P.USER_ID = P_USER_ID
                    AND B.STATUS = 'completed'
            ) ) INTO DASHBOARD_DATA;
    END IF;

    RETURN DASHBOARD_DATA;
END;

$$               LANGUAGE PLPGSQL SECURITY DEFINER;
 
-- Create view for provider search results
CREATE           VIEW PUBLIC.PROVIDER_SEARCH_VIEW AS
SELECT
    P.ID,
    P.USER_ID,
    P.BUSINESS_NAME,
    P.DESCRIPTION,
    P.SERVICES,
    P.LOCATION,
    P.RATING,
    P.REVIEW_COUNT,
    P.PRICE_RANGE,
    P.IMAGES,
    P.CERTIFICATIONS,
    P.EXPERIENCE_YEARS,
    P.IS_VERIFIED,
    P.CREATED_AT,
    U.FULL_NAME AS OWNER_NAME,
    U.AVATAR_URL AS OWNER_AVATAR
FROM
    PUBLIC.PROVIDERS P
    JOIN PUBLIC.USERS U
    ON U.ID = P.USER_ID
WHERE
    P.STATUS = 'active';
 
-- Create view for booking details
CREATE           VIEW PUBLIC.BOOKING_DETAILS_VIEW AS
SELECT
    B.*,
    C.FULL_NAME AS CUSTOMER_NAME,
    C.AVATAR_URL AS CUSTOMER_AVATAR,
    P.BUSINESS_NAME AS PROVIDER_NAME,
    P.USER_ID AS PROVIDER_USER_ID,
    S.NAME AS SERVICE_NAME,
    PET.NAME AS PET_NAME,
    PET.SPECIES AS PET_SPECIES
FROM
    PUBLIC.BOOKINGS B
    JOIN PUBLIC.USERS C
    ON C.ID = B.CUSTOMER_ID
    JOIN PUBLIC.PROVIDERS P
    ON P.ID = B.PROVIDER_ID
    LEFT JOIN PUBLIC.SERVICES S
    ON S.ID = B.SERVICE_ID
    LEFT JOIN PUBLIC.PETS PET
    ON PET.ID = B.PET_ID;