-- Add avatar_url field to providers table
ALTER TABLE PUBLIC.PROVIDERS
    ADD COLUMN AVATAR_URL TEXT;

-- Add comment for documentation
COMMENT ON COLUMN PUBLIC.PROVIDERS.AVATAR_URL IS 'URL to the provider profile picture/avatar image';