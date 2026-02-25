-- Create newsletter_subscriptions table
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_token UUID DEFAULT gen_random_uuid(),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS: Allow anonymous inserts (for subscriptions)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- RLS: Allow updates via verification token (for verification flow)
CREATE POLICY "Can verify with token" ON newsletter_subscriptions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS: Allow selecting (for checking subscription status)
CREATE POLICY "Can check subscription" ON newsletter_subscriptions
  FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_token ON newsletter_subscriptions(verification_token);
