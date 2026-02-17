-- RPC function to increment views_count for a listing
CREATE OR REPLACE FUNCTION increment_views(listing_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_views(uuid) TO authenticated;
