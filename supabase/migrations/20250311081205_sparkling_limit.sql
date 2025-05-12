/*
  # Fix lab test policies

  1. Changes
    - Update RLS policies for lab tests to properly handle doctor authentication
    - Add policy for doctors to create lab tests using their email
    - Ensure proper access control for all roles

  2. Security
    - Maintain RLS on lab_tests table
    - Update policies to use proper authentication checks
    - Keep existing patient and lab technician policies
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Doctors can create lab tests" ON lab_tests;
  DROP POLICY IF EXISTS "Doctors can view tests they created" ON lab_tests;
END $$;

-- Create updated policies for doctors
CREATE POLICY "Doctors can create lab tests"
  ON lab_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors 
    WHERE email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Doctors can view tests they created"
  ON lab_tests
  FOR SELECT
  TO authenticated
  USING (doctor_id IN (
    SELECT id FROM doctors 
    WHERE email = auth.jwt() ->> 'email'
  ));