-- Create category-icons storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-icons',
  'category-icons',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Policy: Allow anyone to read category icons (public bucket)
CREATE POLICY "Public read access for category icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-icons');

-- Policy: Allow authenticated users to upload category icons
CREATE POLICY "Authenticated users can upload category icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'category-icons');

-- Policy: Allow authenticated users to update category icons
CREATE POLICY "Authenticated users can update category icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'category-icons');

-- Policy: Allow authenticated users to delete category icons
CREATE POLICY "Authenticated users can delete category icons"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'category-icons');
