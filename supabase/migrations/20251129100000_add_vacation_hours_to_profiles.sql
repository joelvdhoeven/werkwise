-- Add vacation hours tracking columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vacation_hours_total DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vacation_hours_used DECIMAL(10,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.vacation_hours_total IS 'Total annual vacation hours allocated to the user';
COMMENT ON COLUMN public.profiles.vacation_hours_used IS 'Vacation hours already used by the user';
