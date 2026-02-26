-- Enable RLS on categories and locations tables
-- Resolves security audit findings API-C1 and API-C2 (CRITICAL)
-- These tables had SELECT policies but RLS was not enabled, allowing unauthorized modifications

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Categories: Admins and moderators can insert
CREATE POLICY "Admins and moderators can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Categories: Admins and moderators can update
CREATE POLICY "Admins and moderators can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Categories: Admins and moderators can delete
CREATE POLICY "Admins and moderators can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Locations: Admins and moderators can insert
CREATE POLICY "Admins and moderators can insert locations"
  ON locations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Locations: Admins and moderators can update
CREATE POLICY "Admins and moderators can update locations"
  ON locations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Locations: Admins and moderators can delete
CREATE POLICY "Admins and moderators can delete locations"
  ON locations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );
