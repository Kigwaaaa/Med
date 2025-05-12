/*
  # Add Profile Creation Trigger

  1. Changes
    - Create trigger function to automatically create profile on user signup
    - Add trigger to auth.users table
    - Ensure all required profile fields are populated

  2. Security
    - Function executes with security definer to ensure proper permissions
*/

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    surname,
    age,
    gender,
    upcoming_appointments
  ) VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'first_name')::text,
    (NEW.raw_user_meta_data->>'surname')::text,
    (NEW.raw_user_meta_data->>'age')::integer,
    (NEW.raw_user_meta_data->>'gender')::text,
    0
  );
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();