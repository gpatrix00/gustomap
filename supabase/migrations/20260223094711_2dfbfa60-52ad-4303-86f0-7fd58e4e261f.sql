
-- Fix 1: Add CHECK constraints for server-side validation
ALTER TABLE public.reviews
ADD CONSTRAINT name_length CHECK (char_length(name) <= 100),
ADD CONSTRAINT location_length CHECK (char_length(location) <= 200),
ADD CONSTRAINT description_length CHECK (char_length(description) <= 2000);

ALTER TABLE public.reviews
ADD CONSTRAINT latitude_range CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
ADD CONSTRAINT longitude_range CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

ALTER TABLE public.reviews
ADD CONSTRAINT price_positive CHECK (avg_price_per_person IS NULL OR avg_price_per_person >= 0);

ALTER TABLE public.reviews
ADD CONSTRAINT valid_visit_status CHECK (visit_status IN ('visited', 'wishlist'));

-- Fix 2: Make review-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'review-images';

-- Drop the public SELECT policy on storage
DROP POLICY IF EXISTS "Review images are publicly accessible" ON storage.objects;

-- Users can view their own images (stored under userId/ prefix)
CREATE POLICY "Users can view their own review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);
