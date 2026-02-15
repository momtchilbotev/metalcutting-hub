-- Performance indexes
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_location ON listings(location_id);
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_expires ON listings(expires_at);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_reviews_reviewed_user ON reviews(reviewed_user_id);

-- Full-text search index for Bulgarian
CREATE INDEX idx_listings_fts ON listings USING GIN (to_tsvector('bg', title || ' ' || COALESCE(description, '')));

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment views_count
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings SET views_count = views_count + 1 WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-increment views when accessing listing details
-- Note: This would be called from the application layer
