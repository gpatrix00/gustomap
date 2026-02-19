
-- Add new columns to reviews table
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS visit_status text NOT NULL DEFAULT 'visited',
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS visit_date date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS avg_price_per_person numeric,
  ADD COLUMN IF NOT EXISTS google_photo_url text;
