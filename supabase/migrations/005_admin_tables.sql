-- Audit log for admin actions
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'approve_listing', 'delete_user', 'ban_user', etc.
  target_type VARCHAR(50), -- 'listing', 'user', 'category', etc.
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for audit queries
CREATE INDEX idx_audit_log_admin ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX idx_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX idx_audit_log_action ON admin_audit_log(action, created_at DESC);

-- Enable RLS on admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log
CREATE POLICY "Only admins can view audit log"
  ON admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins and moderators can insert audit log
CREATE POLICY "Admins can insert audit log"
  ON admin_audit_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator', 'admin')
    )
  );

-- Update RLS policies for admin access on existing tables

-- Listings: Admins can view all listings
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON listings;

CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT USING (
    status = 'active' OR
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator', 'admin')
    )
  );

-- Listings: Admins can update any listing
CREATE POLICY "Admins can update any listing"
  ON listings FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator', 'admin')
    )
  );

-- Listings: Admins can delete any listing
CREATE POLICY "Admins can delete any listing"
  ON listings FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Profiles: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (
    true OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('moderator', 'admin')
    )
  );

-- Profiles: Admins can update user roles
CREATE POLICY "Admins can manage user roles"
  ON profiles FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
