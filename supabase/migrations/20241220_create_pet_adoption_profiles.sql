-- Create pet types table (directly linked to providers)
CREATE TABLE IF NOT EXISTS PET_TYPES (
    ID UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
    PROVIDER_ID UUID NOT NULL REFERENCES PROVIDERS(ID) ON DELETE CASCADE,
    TITLE TEXT NOT NULL,
    DESCRIPTION TEXT NOT NULL,
    BREED_TYPE TEXT NOT NULL,
    IS_ACTIVE BOOLEAN DEFAULT TRUE,
    CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create individual pets table
CREATE TABLE IF NOT EXISTS INDIVIDUAL_PETS (
    ID UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
    PET_TYPE_ID UUID NOT NULL REFERENCES PET_TYPES(ID) ON DELETE CASCADE,
    TITLE TEXT NOT NULL,
    PRICE DECIMAL(10, 2) NOT NULL,
    GALLERY TEXT[] DEFAULT '{}',
    SEX_TYPE TEXT NOT NULL CHECK (SEX_TYPE IN ('male', 'female')),
    AGE INTEGER NOT NULL, -- age in weeks
    READY_TO_LEAVE DATE NOT NULL,
    FEATURES TEXT[] DEFAULT '{}', -- array of feature types
    CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS IDX_PET_TYPES_PROVIDER_ID ON PET_TYPES(PROVIDER_ID);

CREATE INDEX IF NOT EXISTS IDX_PET_TYPES_IS_ACTIVE ON PET_TYPES(IS_ACTIVE);

CREATE INDEX IF NOT EXISTS IDX_INDIVIDUAL_PETS_PET_TYPE_ID ON INDIVIDUAL_PETS(PET_TYPE_ID);

CREATE INDEX IF NOT EXISTS IDX_INDIVIDUAL_PETS_READY_TO_LEAVE ON INDIVIDUAL_PETS(READY_TO_LEAVE);

-- Enable Row Level Security
ALTER TABLE PET_TYPES ENABLE ROW LEVEL SECURITY;

ALTER TABLE INDIVIDUAL_PETS ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pet_types
CREATE POLICY "Users can view active pet types" ON PET_TYPES
  FOR SELECT USING (IS_ACTIVE = TRUE);

CREATE POLICY "Providers can manage their own pet types" ON PET_TYPES
  FOR ALL USING (
    PROVIDER_ID IN (
    SELECT
                  ID
    FROM
                  PROVIDERS
    WHERE
                  USER_ID = AUTH.UID()
)
  );

-- RLS Policies for individual_pets
CREATE POLICY "Users can view individual pets of active pet types" ON INDIVIDUAL_PETS
  FOR SELECT USING (
    PET_TYPE_ID IN (
    SELECT
                  ID
    FROM
                  PET_TYPES
    WHERE
                  IS_ACTIVE = TRUE
)
  );

CREATE POLICY "Providers can manage individual pets of their pet types" ON INDIVIDUAL_PETS
  FOR ALL USING (
    PET_TYPE_ID IN (
    SELECT
                  ID
    FROM
                  PET_TYPES
    WHERE
                  PROVIDER_ID IN (
            SELECT
                                  ID
            FROM
                                  PROVIDERS
            WHERE
                                  USER_ID = AUTH.UID()
        )
)
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION UPDATE_UPDATED_AT_COLUMN(
) RETURNS TRIGGER AS
    $$      BEGIN NEW.UPDATED_AT = NOW();
    RETURN  NEW;
END;
$$      LANGUAGE PLPGSQL;
 
-- Create triggers for updated_at
CREATE  TRIGGER UPDATE_PET_TYPES_UPDATED_AT BEFORE UPDATE ON PET_TYPES FOR EACH ROW EXECUTE

FUNCTION UPDATE_UPDATED_AT_COLUMN(
);
CREATE  TRIGGER UPDATE_INDIVIDUAL_PETS_UPDATED_AT BEFORE UPDATE ON INDIVIDUAL_PETS FOR EACH ROW EXECUTE

FUNCTION UPDATE_UPDATED_AT_COLUMN(
);
 
-- Add comments for documentation
COMMENT ON TABLE PET_TYPES IS
    'Pet types for adoption/breeding businesses (e.g., Toy Poodle, Standard Poodle)';
COMMENT ON TABLE INDIVIDUAL_PETS IS
    'Individual pets available for adoption within each pet type';
COMMENT ON COLUMN PET_TYPES.TITLE IS
    'Pet type title (e.g., "Toy Poodle")';
COMMENT ON COLUMN PET_TYPES.DESCRIPTION IS
    'Pet type description';
COMMENT ON COLUMN PET_TYPES.BREED_TYPE IS
    'Breed type for this pet type';
COMMENT ON COLUMN PET_TYPES.PROVIDER_ID IS
    'Reference to the provider who owns this pet type';
COMMENT ON COLUMN INDIVIDUAL_PETS.TITLE IS
    'Individual pet title (e.g., "Puppy #1")';
COMMENT ON COLUMN INDIVIDUAL_PETS.PRICE IS
    'Price in euros';
COMMENT ON COLUMN INDIVIDUAL_PETS.GALLERY IS
    'Array of image URLs';
COMMENT ON COLUMN INDIVIDUAL_PETS.SEX_TYPE IS
    'Sex: male or female';
COMMENT ON COLUMN INDIVIDUAL_PETS.AGE IS
    'Age in weeks';
COMMENT ON COLUMN INDIVIDUAL_PETS.READY_TO_LEAVE IS
    'Date when pet is ready to leave';
COMMENT ON COLUMN INDIVIDUAL_PETS.FEATURES IS
    'Array of features: microchipped, vaccinated, wormed, health_checked, parents_tested, kc_registered';