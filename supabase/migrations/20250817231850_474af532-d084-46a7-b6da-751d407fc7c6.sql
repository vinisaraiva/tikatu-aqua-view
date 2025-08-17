-- Remove the redundant reading_factors table
-- The environmental factors are already properly stored in the readings table as boolean columns
DROP TABLE IF EXISTS public.reading_factors;