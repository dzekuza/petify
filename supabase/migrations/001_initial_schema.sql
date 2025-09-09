-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE USER_ROLE AS
    ENUM ('customer', 'provider', 'admin');
    CREATE TYPE SERVICE_CATEGORY AS
        ENUM ('grooming', 'veterinary', 'boarding', 'training', 'walking', 'sitting', 'adoption');
        CREATE TYPE BOOKING_STATUS AS
            ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
            CREATE TYPE PROVIDER_STATUS AS
                ENUM ('active', 'inactive', 'suspended', 'pending_verification');
                CREATE TYPE PAYMENT_STATUS AS
                    ENUM ('pending', 'paid', 'failed', 'refunded');
 
                    -- Users table (extends Supabase auth.users)
                    CREATE TABLE PUBLIC.USERS ( ID UUID REFERENCES AUTH.USERS(ID) ON DELETE CASCADE PRIMARY KEY, EMAIL TEXT UNIQUE NOT NULL, FULL_NAME TEXT, AVATAR_URL TEXT, PHONE TEXT, ROLE USER_ROLE DEFAULT 'customer', CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- User profiles for additional information
                    CREATE TABLE PUBLIC.USER_PROFILES ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, USER_ID UUID REFERENCES PUBLIC.USERS(ID) ON DELETE CASCADE, BIO TEXT, DATE_OF_BIRTH DATE, ADDRESS JSONB, -- {street, city, state, zip, country, coordinates}
                    PREFERENCES JSONB, -- {notifications, privacy, etc}
                    CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- Providers table
                    CREATE TABLE PUBLIC.PROVIDERS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, USER_ID UUID REFERENCES PUBLIC.USERS(ID) ON DELETE CASCADE, BUSINESS_NAME TEXT NOT NULL, BUSINESS_TYPE TEXT, -- individual, business, clinic, etc
                    DESCRIPTION TEXT, SERVICES SERVICE_CATEGORY[] DEFAULT '{}', LOCATION JSONB NOT NULL, -- {address, city, state, zip, coordinates: {lat, lng}}
                    CONTACT_INFO JSONB, -- {phone, email, website, social_media}
                    BUSINESS_HOURS JSONB, -- {monday: {start, end, available}, ...}
                    RATING DECIMAL(3, 2) DEFAULT 0, REVIEW_COUNT INTEGER DEFAULT 0, PRICE_RANGE JSONB, -- {min, max, currency}
                    AVAILABILITY JSONB, -- availability slots
                    IMAGES TEXT[] DEFAULT '{}', -- array of image URLs
                    CERTIFICATIONS TEXT[] DEFAULT '{}', EXPERIENCE_YEARS INTEGER DEFAULT 0, STATUS PROVIDER_STATUS DEFAULT 'pending_verification', IS_VERIFIED BOOLEAN DEFAULT FALSE, VERIFICATION_DOCUMENTS JSONB, -- {license, insurance, etc}
                    CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- Services table (detailed service offerings)
                    CREATE TABLE PUBLIC.SERVICES ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, PROVIDER_ID UUID REFERENCES PUBLIC.PROVIDERS(ID) ON DELETE CASCADE, NAME TEXT NOT NULL, CATEGORY SERVICE_CATEGORY NOT NULL, DESCRIPTION TEXT, PRICE DECIMAL(10, 2), DURATION_MINUTES INTEGER, -- service duration in minutes
                    MAX_PETS INTEGER DEFAULT 1, REQUIREMENTS TEXT[], -- special requirements
                    INCLUDES TEXT[], -- what's included
                    IMAGES TEXT[] DEFAULT '{}', IS_ACTIVE BOOLEAN DEFAULT TRUE, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- Pet profiles
                    CREATE TABLE PUBLIC.PETS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, OWNER_ID UUID REFERENCES PUBLIC.USERS(ID) ON DELETE CASCADE, NAME TEXT NOT NULL, SPECIES TEXT NOT NULL, -- dog, cat, bird, etc
                    BREED TEXT, AGE INTEGER, -- in months
                    WEIGHT DECIMAL(5, 2), -- in kg
                    SIZE TEXT, -- small, medium, large
                    GENDER TEXT, -- male, female
                    COLOR TEXT, MEDICAL_NOTES TEXT, BEHAVIORAL_NOTES TEXT, SPECIAL_NEEDS TEXT[], VACCINATION_RECORDS JSONB, IMAGES TEXT[] DEFAULT '{}', CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- Bookings table
                    CREATE TABLE PUBLIC.BOOKINGS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, CUSTOMER_ID UUID REFERENCES PUBLIC.USERS(ID) ON DELETE CASCADE, PROVIDER_ID UUID REFERENCES PUBLIC.PROVIDERS(ID) ON DELETE CASCADE, SERVICE_ID UUID REFERENCES PUBLIC.SERVICES(ID) ON DELETE SET NULL, PET_ID UUID REFERENCES PUBLIC.PETS(ID) ON DELETE SET NULL, BOOKING_DATE DATE NOT NULL, START_TIME TIME NOT NULL, END_TIME TIME NOT NULL, DURATION_MINUTES INTEGER NOT NULL, STATUS BOOKING_STATUS DEFAULT 'pending', TOTAL_PRICE DECIMAL(10, 2) NOT NULL, SPECIAL_INSTRUCTIONS TEXT, LOCATION JSONB, -- booking location details
                    PAYMENT_STATUS PAYMENT_STATUS DEFAULT 'pending', PAYMENT_ID TEXT, -- external payment system ID
                    CANCELLATION_REASON TEXT, CANCELLED_AT TIMESTAMP WITH TIME ZONE, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- Reviews table
                    CREATE TABLE PUBLIC.REVIEWS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, BOOKING_ID UUID REFERENCES PUBLIC.BOOKINGS(ID) ON DELETE CASCADE, CUSTOMER_ID UUID REFERENCES PUBLIC.USERS(ID) ON DELETE CASCADE, PROVIDER_ID UUID REFERENCES PUBLIC.PROVIDERS(ID) ON DELETE CASCADE, RATING INTEGER CHECK (RATING >= 1
                    AND RATING <= 5) NOT NULL, TITLE TEXT, COMMENT TEXT, IMAGES TEXT[] DEFAULT '{}', IS_PUBLIC BOOLEAN DEFAULT TRUE, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- Messages/Conversations
                    CREATE TABLE PUBLIC.CONVERSATIONS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, CUSTOMER_ID UUID REFERENCES PUBLIC.USERS(ID) ON DELETE CASCADE, PROVIDER_ID UUID REFERENCES PUBLIC.PROVIDERS(ID) ON DELETE CASCADE, BOOKING_ID UUID REFERENCES PUBLIC.BOOKINGS(ID) ON DELETE SET NULL, LAST_MESSAGE_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
                    CREATE TABLE PUBLIC.MESSAGES ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, CONVERSATION_ID UUID REFERENCES PUBLIC.CONVERSATIONS(ID) ON DELETE CASCADE, SENDER_ID UUID REFERENCES PUBLIC.USERS(ID) ON DELETE CASCADE, CONTENT TEXT NOT NULL, MESSAGE_TYPE TEXT DEFAULT 'text', -- text, image, file
                    ATTACHMENTS TEXT[] DEFAULT '{}', IS_READ BOOLEAN DEFAULT FALSE, READ_AT TIMESTAMP WITH TIME ZONE, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- Favorites table
                    CREATE TABLE PUBLIC.FAVORITES ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, USER_ID UUID REFERENCES PUBLIC.USERS(ID) ON DELETE CASCADE, PROVIDER_ID UUID REFERENCES PUBLIC.PROVIDERS(ID) ON DELETE CASCADE, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(USER_ID, PROVIDER_ID) );
 
                    -- Notifications table
                    CREATE TABLE PUBLIC.NOTIFICATIONS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, USER_ID UUID REFERENCES PUBLIC.USERS(ID) ON DELETE CASCADE, TITLE TEXT NOT NULL, MESSAGE TEXT NOT NULL, TYPE TEXT NOT NULL, -- booking, message, review, etc
                    DATA JSONB, -- additional data
                    IS_READ BOOLEAN DEFAULT FALSE, READ_AT TIMESTAMP WITH TIME ZONE, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- Service categories for filtering
                    CREATE TABLE PUBLIC.SERVICE_CATEGORIES ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, NAME TEXT UNIQUE NOT NULL, DESCRIPTION TEXT, ICON TEXT, -- emoji or icon name
                    IS_ACTIVE BOOLEAN DEFAULT TRUE, SORT_ORDER INTEGER DEFAULT 0, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
                    -- Insert default service categories
                    INSERT INTO PUBLIC.SERVICE_CATEGORIES (
                        NAME,
                        DESCRIPTION,
                        ICON,
                        SORT_ORDER
                    ) VALUES (
                        'Grooming',
                        'Professional pet grooming services',
                        '🐕',
                        1
                    ), (
                        'Veterinary',
                        'Medical care and health services',
                        '🏥',
                        2
                    ), (
                        'Boarding',
                        'Overnight pet care and accommodation',
                        '🏠',
                        3
                    ), (
                        'Training',
                        'Behavioral training and obedience',
                        '🎓',
                        4
                    ), (
                        'Sitting',
                        'In-home pet sitting and care',
                        '🛋️',
                        5
                    ), (
                        'Adoption',
                        'Pet sales and adoption listings',
                        '🏠',
                        6
                    );
 
                    -- Create indexes for better performance
                    CREATE INDEX IDX_PROVIDERS_SERVICES ON PUBLIC.PROVIDERS USING GIN (SERVICES);
                    CREATE INDEX IDX_PROVIDERS_STATUS ON PUBLIC.PROVIDERS (STATUS);
                    CREATE INDEX IDX_PROVIDERS_RATING ON PUBLIC.PROVIDERS (RATING DESC);
                    CREATE INDEX IDX_BOOKINGS_CUSTOMER ON PUBLIC.BOOKINGS (CUSTOMER_ID);
                    CREATE INDEX IDX_BOOKINGS_PROVIDER ON PUBLIC.BOOKINGS (PROVIDER_ID);
                    CREATE INDEX IDX_BOOKINGS_DATE ON PUBLIC.BOOKINGS (BOOKING_DATE);
                    CREATE INDEX IDX_BOOKINGS_STATUS ON PUBLIC.BOOKINGS (STATUS);
                    CREATE INDEX IDX_REVIEWS_PROVIDER ON PUBLIC.REVIEWS (PROVIDER_ID);
                    CREATE INDEX IDX_REVIEWS_RATING ON PUBLIC.REVIEWS (RATING);
                    CREATE INDEX IDX_MESSAGES_CONVERSATION ON PUBLIC.MESSAGES (CONVERSATION_ID);
                    CREATE INDEX IDX_MESSAGES_CREATED ON PUBLIC.MESSAGES (CREATED_AT DESC);
                    CREATE INDEX IDX_NOTIFICATIONS_USER ON PUBLIC.NOTIFICATIONS (USER_ID);
                    CREATE INDEX IDX_NOTIFICATIONS_READ ON PUBLIC.NOTIFICATIONS (IS_READ);
 
                    -- Create updated_at trigger function
                    CREATE OR REPLACE FUNCTION UPDATE_UPDATED_AT_COLUMN() RETURNS TRIGGER AS
                        $$
                        BEGIN
                            NEW.UPDATED_AT = NOW();
                            RETURN NEW;
                        END;

                        $$ LANGUAGE 'plpgsql';
 
                        -- Apply updated_at triggers to all tables
                        CREATE TRIGGER UPDATE_USERS_UPDATED_AT BEFORE
                        UPDATE ON PUBLIC.USERS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
                        );
                        CREATE TRIGGER UPDATE_USER_PROFILES_UPDATED_AT BEFORE
                        UPDATE ON PUBLIC.USER_PROFILES FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
                        );
                        CREATE TRIGGER UPDATE_PROVIDERS_UPDATED_AT BEFORE
                        UPDATE ON PUBLIC.PROVIDERS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
                        );
                        CREATE TRIGGER UPDATE_SERVICES_UPDATED_AT BEFORE
                        UPDATE ON PUBLIC.SERVICES FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
                        );
                        CREATE TRIGGER UPDATE_PETS_UPDATED_AT BEFORE
                        UPDATE ON PUBLIC.PETS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
                        );
                        CREATE TRIGGER UPDATE_BOOKINGS_UPDATED_AT BEFORE
                        UPDATE ON PUBLIC.BOOKINGS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
                        );
                        CREATE TRIGGER UPDATE_REVIEWS_UPDATED_AT BEFORE
                        UPDATE ON PUBLIC.REVIEWS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
                        );
                        CREATE TRIGGER UPDATE_CONVERSATIONS_UPDATED_AT BEFORE
                        UPDATE ON PUBLIC.CONVERSATIONS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
                        );