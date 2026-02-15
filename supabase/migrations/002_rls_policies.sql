-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Locations: Public read for everyone
CREATE POLICY "Public locations are viewable by everyone"
  ON locations FOR SELECT USING (true);

-- Categories: Public read for everyone
CREATE POLICY "Public categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

-- Profiles: Users can read all profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: Everyone can read active listings
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create own listings"
  ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE USING (auth.uid() = user_id);

-- Listing Images: Public read for images of active listings
CREATE POLICY "Listing images are viewable for active listings"
  ON listing_images FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND (listings.status = 'active' OR listings.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload images for own listings"
  ON listing_images FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images from own listings"
  ON listing_images FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Messages: Users can read messages they sent or received
CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status of received messages"
  ON messages FOR UPDATE USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Users can delete own sent messages"
  ON messages FOR DELETE USING (auth.uid() = sender_id);

-- Watchlist: Users can read own watchlist
CREATE POLICY "Users can read own watchlist"
  ON watchlist FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own watchlist"
  ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own watchlist"
  ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- Reviews: Public read for everyone
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE USING (auth.uid() = reviewer_id);
