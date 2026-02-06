-- Add latitude and longitude columns for map functionality
ALTER TABLE public.reviews 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;