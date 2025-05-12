/*
  # Fix Profile Creation Trigger

  1. Changes
    - Drop existing trigger if it exists
    - Create new trigger function with proper error handling
    - Add trigger to auth.users table
    - Ensure all required profile fields are populated

  2. Security
    - Function executes with security definer to ensure proper permissions
    - Proper error handling for missing metadata
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  first_name_val text;
  surname_val text;
  age_val integer;
  gender_val text;
BEGIN
  -- Extract values from metadata with proper error handling
  first_name_val := COALESCE(
    (NEW.raw_user_meta_data->>'first_name')::text,
    'Unknown'
  );
  
  surname_val := COALESCE(
    (NEW.raw_user_meta_data->>'surname')::text,
    'Unknown'
  );
  
  -- Convert age to integer with fallback
  BEGIN
    age_val := (NEW.raw_user_meta_data->>'age')::integer;
  EXCEPTION WHEN OTHERS THEN
    age_val := 0;
  END;
  
  gender_val := COALESCE(
    (NEW.raw_user_meta_data->>'gender')::text,
    'Not specified'
  );

  -- Insert the profile with validated data
  INSERT INTO public.profiles (
    id,
    first_name,
    surname,
    age,
    gender,
    upcoming_appointments,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    first_name_val,
    surname_val,
    age_val,
    gender_val,
    0,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();