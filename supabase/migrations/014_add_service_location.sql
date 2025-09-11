-- Add per-service location snapshot to services
ALTER TABLE PUBLIC.SERVICES
    ADD COLUMN IF NOT EXISTS SERVICE_LOCATION JSONB;

-- { address, city, state, zip, coordinates }

-- Optional: index for queries by city/zip if needed later
-- CREATE INDEX IF NOT EXISTS idx_services_service_location_city ON public.services ((service_location->>'city'));