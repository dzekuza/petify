CREATE TABLE IF NOT EXISTS waitlist_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_subscriptions_email_unique UNIQUE (email)
);

ALTER TABLE waitlist_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public insert (anyone can subscribe)
CREATE POLICY "Anyone can subscribe" ON waitlist_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service role can read (admin only)
CREATE POLICY "Service role can read" ON waitlist_subscriptions
  FOR SELECT
  TO service_role
  USING (true);
