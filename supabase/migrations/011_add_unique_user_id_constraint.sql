-- Add unique constraint on user_id in providers table to prevent multiple providers per user
-- First, remove any duplicate providers (keep the most recent one)

-- Delete duplicate providers, keeping only the most recent one for each user
WITH RANKED_PROVIDERS AS (
    SELECT
        ID,
        USER_ID,
        CREATED_AT,
        ROW_NUMBER() OVER (PARTITION BY USER_ID ORDER BY CREATED_AT DESC) AS RN
    FROM
        PUBLIC.PROVIDERS
) DELETE FROM PUBLIC.PROVIDERS WHERE ID IN (
    SELECT
        ID
    FROM
        RANKED_PROVIDERS
    WHERE
        RN > 1
);

-- Add unique constraint on user_id
ALTER TABLE PUBLIC.PROVIDERS
    ADD CONSTRAINT PROVIDERS_USER_ID_UNIQUE UNIQUE (
        USER_ID
    );