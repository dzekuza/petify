-- Fix the get_provider_availability function parameter order
-- The function parameters were in the wrong order compared to the frontend call

DROP FUNCTION IF EXISTS PUBLIC.GET_PROVIDER_AVAILABILITY(UUID, DATE);

CREATE OR REPLACE FUNCTION PUBLIC.GET_PROVIDER_AVAILABILITY(
    PROVIDER_UUID UUID,
    CHECK_DATE DATE
) RETURNS TABLE ( IS_AVAILABLE BOOLEAN, AVAILABLE_SLOTS JSONB ) AS
    $$  BEGIN RETURN QUERY
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
$$  LANGUAGE PLPGSQL SECURITY DEFINER;