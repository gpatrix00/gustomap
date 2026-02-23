ALTER TABLE public.reviews DROP CONSTRAINT reviews_rating_check;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 0 AND rating <= 5);