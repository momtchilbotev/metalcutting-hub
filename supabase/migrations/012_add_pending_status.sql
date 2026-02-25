-- Add 'pending' and 'rejected' to the status enum in listings table
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('active', 'draft', 'sold', 'expired', 'pending', 'rejected'));

-- Add rejection_reason column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add reviewed_by and reviewed_at columns for tracking
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
