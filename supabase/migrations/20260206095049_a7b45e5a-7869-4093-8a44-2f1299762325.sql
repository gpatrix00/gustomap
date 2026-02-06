-- Add is_public column to reviews for public sharing
ALTER TABLE public.reviews ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Create policy for public read access to shared reviews
CREATE POLICY "Anyone can view public reviews"
ON public.reviews FOR SELECT
USING (is_public = true);