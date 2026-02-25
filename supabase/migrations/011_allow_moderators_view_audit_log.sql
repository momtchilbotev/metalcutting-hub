-- Drop the existing policy that restricts view to admins only
DROP POLICY IF EXISTS "Only admins can view audit log" ON admin_audit_log;

-- Create new policy that allows both admins and moderators to view
CREATE POLICY "Admins and moderators can view audit log" ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );
