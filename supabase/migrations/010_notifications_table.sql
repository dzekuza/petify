-- Create notifications table for providers
CREATE TABLE IF NOT EXISTS NOTIFICATIONS (
    ID UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
    PROVIDER_ID UUID NOT NULL REFERENCES AUTH.USERS(ID) ON DELETE CASCADE,
    TYPE VARCHAR(50) NOT NULL CHECK (TYPE IN ( 'new_booking', 'upcoming_booking', 'booking_cancelled', 'booking_completed', 'payment_received', 'review_received' )),
    TITLE VARCHAR(255) NOT NULL,
    MESSAGE TEXT NOT NULL,
    DATA JSONB DEFAULT '{}',
    READ BOOLEAN DEFAULT FALSE,
    CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS IDX_NOTIFICATIONS_PROVIDER_ID ON NOTIFICATIONS(PROVIDER_ID);

CREATE INDEX IF NOT EXISTS IDX_NOTIFICATIONS_CREATED_AT ON NOTIFICATIONS(CREATED_AT DESC);

CREATE INDEX IF NOT EXISTS IDX_NOTIFICATIONS_READ ON NOTIFICATIONS(READ);

CREATE INDEX IF NOT EXISTS IDX_NOTIFICATIONS_TYPE ON NOTIFICATIONS(TYPE);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION UPDATE_UPDATED_AT_COLUMN(
) RETURNS TRIGGER AS
    $$     BEGIN NEW.UPDATED_AT = NOW();
    RETURN NEW;
END;
$$     LANGUAGE 'plpgsql';
CREATE TRIGGER UPDATE_NOTIFICATIONS_UPDATED_AT BEFORE UPDATE ON NOTIFICATIONS FOR EACH ROW EXECUTE

FUNCTION UPDATE_UPDATED_AT_COLUMN(
);
 
-- Enable RLS
ALTER  TABLE NOTIFICATIONS ENABLE ROW LEVEL SECURITY;
 
-- Create RLS policies
CREATE POLICY "Providers can view their own notifications" ON NOTIFICATIONS FOR
SELECT
    USING (AUTH.UID() = PROVIDER_ID);
CREATE POLICY "Providers can update their own notifications" ON NOTIFICATIONS FOR UPDATE USING (AUTH.UID() = PROVIDER_ID);
CREATE POLICY "System can insert notifications" ON NOTIFICATIONS FOR INSERT WITH CHECK (
    TRUE
);
 
-- Create function to automatically create notifications for new bookings
CREATE OR REPLACE

FUNCTION CREATE_BOOKING_NOTIFICATION(
) RETURNS TRIGGER AS
    $$     BEGIN
 -- Create notification for new booking
    INSERT INTO NOTIFICATIONS (
        PROVIDER_ID,
        TYPE,
        TITLE,
        MESSAGE,
        DATA
    ) VALUES (
        NEW.PROVIDER_ID,
        'new_booking',
        'Naujas rezervavimas',
        'Gavote naują rezervavimą nuo '
        || COALESCE(NEW.CUSTOMER_NAME, 'kliento'),
        JSONB_BUILD_OBJECT( 'booking_id', NEW.ID, 'customer_name', NEW.CUSTOMER_NAME, 'service_date', NEW.SERVICE_DATE, 'service_time', NEW.SERVICE_TIME )
    );
    RETURN NEW;
END;
$$     LANGUAGE PLPGSQL;
 
-- Create trigger for new bookings
CREATE TRIGGER TRIGGER_NEW_BOOKING_NOTIFICATION AFTER INSERT ON BOOKINGS FOR EACH ROW EXECUTE FUNCTION CREATE_BOOKING_NOTIFICATION(
);
 
-- Create function to create upcoming booking notifications (24 hours before)
CREATE OR REPLACE

FUNCTION CREATE_UPCOMING_BOOKING_NOTIFICATION(
) RETURNS TRIGGER AS
    $$     BEGIN
 -- Check if booking is 24 hours away
    IF NEW.SERVICE_DATE = CURRENT_DATE + INTERVAL '1 day' THEN
        INSERT INTO NOTIFICATIONS (
            PROVIDER_ID,
            TYPE,
            TITLE,
            MESSAGE,
            DATA
        ) VALUES (
            NEW.PROVIDER_ID,
            'upcoming_booking',
            'Artėjantis rezervavimas',
            'Jūsų rezervavimas su '
            || COALESCE(NEW.CUSTOMER_NAME, 'klientu')
               || ' yra rytoj',
            JSONB_BUILD_OBJECT( 'booking_id', NEW.ID, 'customer_name', NEW.CUSTOMER_NAME, 'service_date', NEW.SERVICE_DATE, 'service_time', NEW.SERVICE_TIME )
        );
    END IF;

    RETURN NEW;
END;
$$     LANGUAGE PLPGSQL;
 
-- Create trigger for upcoming bookings
CREATE TRIGGER TRIGGER_UPCOMING_BOOKING_NOTIFICATION AFTER INSERT OR UPDATE ON BOOKINGS FOR EACH ROW EXECUTE FUNCTION CREATE_UPCOMING_BOOKING_NOTIFICATION(
);
 
-- Create function to create payment received notifications
CREATE OR REPLACE

FUNCTION CREATE_PAYMENT_NOTIFICATION(
) RETURNS TRIGGER AS
    $$     BEGIN
 -- Only create notification for successful payments
    IF NEW.STATUS = 'completed' AND OLD.STATUS != 'completed' THEN
        INSERT INTO NOTIFICATIONS (
            PROVIDER_ID,
            TYPE,
            TITLE,
            MESSAGE,
            DATA
        ) VALUES (
            NEW.PROVIDER_ID,
            'payment_received',
            'Gautas mokėjimas',
            'Gavote mokėjimą už rezervavimą #'
            || NEW.BOOKING_ID,
            JSONB_BUILD_OBJECT( 'payment_id', NEW.ID, 'booking_id', NEW.BOOKING_ID, 'amount', NEW.AMOUNT )
        );
    END IF;

    RETURN NEW;
END;
$$     LANGUAGE PLPGSQL;
 
-- Create trigger for payments
CREATE TRIGGER TRIGGER_PAYMENT_NOTIFICATION AFTER UPDATE ON PAYMENTS FOR EACH ROW EXECUTE

FUNCTION CREATE_PAYMENT_NOTIFICATION(
);