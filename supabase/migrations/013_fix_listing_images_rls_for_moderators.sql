-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Listing images are viewable for active listings" ON listing_images;

-- Create new policy that includes moderators and admins
CREATE POLICY "Listing images are viewable for active listings or by staff"
ON listing_images FOR SELECT
USING (
  -- Listing is active (publicly visible)
  EXISTS (
    SELECT 1 FROM listings
    WHERE listings.id = listing_images.listing_id
    AND listings.status = 'active'
  )
  OR
  -- User owns the listing
  EXISTS (
    SELECT 1 FROM listings
    WHERE listings.id = listing_images.listing_id
    AND listings.user_id = auth.uid()
  )
  OR
  -- User is moderator or admin
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('moderator', 'admin')
  )
);
