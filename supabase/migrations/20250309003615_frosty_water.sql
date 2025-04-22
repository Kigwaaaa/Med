/*
  # Add appointments count to profiles

  1. Changes
    - Add `upcoming_appointments` column to profiles table
    - Set default value to 0
    - Add comment explaining the column purpose

  2. Security
    - No additional security needed as we're using existing RLS policies
*/

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS upcoming_appointments integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN profiles.upcoming_appointments IS 'Number of upcoming appointments for the patient';