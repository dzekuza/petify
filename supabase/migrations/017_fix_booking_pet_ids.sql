-- Fix existing bookings that have pet IDs in special_instructions but null pet_id
-- This migration extracts pet IDs from special_instructions and updates the pet_id field

UPDATE BOOKINGS
SET
    PET_ID = (
        SELECT
            REGEXP_REPLACE(SPECIAL_INSTRUCTIONS,
            'Pets: ([a-f0-9-]+).*',
            '\1')
        WHERE
            SPECIAL_INSTRUCTIONS ~ '^Pets: [a-f0-9-]+'
    ),
    SPECIAL_INSTRUCTIONS = NULL
WHERE
    PET_ID IS NULL
    AND SPECIAL_INSTRUCTIONS ~ '^Pets: [a-f0-9-]+'
    AND SPECIAL_INSTRUCTIONS !~ 'Multiple pets:';

-- For bookings with multiple pets, keep the special_instructions but extract the first pet ID
UPDATE BOOKINGS
SET
    PET_ID = (
        SELECT
            REGEXP_REPLACE(SPECIAL_INSTRUCTIONS,
            'Multiple pets: ([a-f0-9-]+).*',
            '\1')
        WHERE
            SPECIAL_INSTRUCTIONS ~ '^Multiple pets: [a-f0-9-]+'
    )
WHERE
    PET_ID IS NULL
    AND SPECIAL_INSTRUCTIONS ~ '^Multiple pets: [a-f0-9-]+';