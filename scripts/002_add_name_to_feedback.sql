-- Add name column to feedback table
ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS name text;

-- Update the feedback insert policy to allow public inserts
-- (Already exists but making sure it's correct)
