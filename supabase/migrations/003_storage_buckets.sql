-- FreeCoin Empire - Storage Buckets
-- Configure Supabase Storage for game assets and user uploads

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create avatars bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create game-assets bucket for static game assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-assets',
  'game-assets',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/json']
) ON CONFLICT (id) DO NOTHING;

-- Create user-uploads bucket for user-generated content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES - AVATARS
-- ============================================

-- Users can upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view all avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE POLICIES - GAME ASSETS
-- ============================================

-- Anyone can view game assets (public bucket)
CREATE POLICY "Anyone can view game assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-assets');

-- Service role can manage game assets
CREATE POLICY "Service can manage game assets"
ON storage.objects FOR ALL
USING (bucket_id = 'game-assets' AND auth.role() = 'service_role');

-- ============================================
-- STORAGE POLICIES - USER UPLOADS
-- ============================================

-- Users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'user-uploads' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-uploads' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
