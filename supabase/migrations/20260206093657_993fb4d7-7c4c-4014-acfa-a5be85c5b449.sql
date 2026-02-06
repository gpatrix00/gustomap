-- Add column for multiple images (as JSON array)
ALTER TABLE public.reviews 
ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url data to image_urls array
UPDATE public.reviews 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END;

-- Keep image_url for backwards compatibility but it will be deprecated