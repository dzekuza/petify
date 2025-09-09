-- Remove 'walking' from SERVICE_CATEGORY enum and update existing data

-- First, update any existing providers that have 'walking' in their services array
UPDATE PUBLIC.PROVIDERS
SET
    SERVICES = ARRAY_REMOVE(
        SERVICES,
        'walking'
    )
WHERE
    'walking' = ANY(SERVICES);

-- Update any existing services that use 'walking' category
UPDATE PUBLIC.SERVICES
SET
    CATEGORY = 'adoption'
WHERE
    CATEGORY = 'walking';

-- Remove 'walking' from the enum
ALTER TYPE SERVICE_CATEGORY DROP VALUE 'walking';