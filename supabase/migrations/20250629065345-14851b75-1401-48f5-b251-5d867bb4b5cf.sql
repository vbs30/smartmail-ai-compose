
-- First, let's create a function to reset daily generations for users whose reset date is in the past
CREATE OR REPLACE FUNCTION reset_daily_generations_if_needed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    daily_generations_count = 0,
    daily_generations_reset_date = CURRENT_DATE
  WHERE daily_generations_reset_date < CURRENT_DATE;
END;
$$;

-- Create a trigger function that runs before any select on profiles to ensure daily reset
CREATE OR REPLACE FUNCTION check_and_reset_daily_generations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user's reset date is in the past and reset if needed
  IF NEW.daily_generations_reset_date < CURRENT_DATE THEN
    NEW.daily_generations_count = 0;
    NEW.daily_generations_reset_date = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a trigger that runs before any update on profiles
CREATE OR REPLACE TRIGGER trigger_reset_daily_generations
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_and_reset_daily_generations();
