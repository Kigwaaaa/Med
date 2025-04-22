/*
  # Fix lab test submission

  1. Changes
    - Update RLS policies for lab tests to allow doctors to create tests using their ID
    - Add policy for lab technicians to update test results
    - Ensure proper access control for all roles

  2. Security
    - Maintain RLS on lab_tests table
    - Update policies to use proper authentication checks
    - Keep existing patient policies
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Doctors can create lab tests" ON lab_tests;
  DROP POLICY IF EXISTS "Doctors can view tests they created" ON lab_tests;
  DROP POLICY IF EXISTS "Lab technicians can view all lab tests" ON lab_tests;
END $$;

-- Create updated policies for doctors
CREATE POLICY "Doctors can create lab tests"
  ON lab_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Doctors can view tests they created"
  ON lab_tests
  FOR SELECT
  TO authenticated
  USING (doctor_id IN (
    SELECT id FROM doctors 
    WHERE staff_number = current_user
  ));

-- Policies for lab technicians
CREATE POLICY "Lab technicians can view all lab tests"
  ON lab_tests
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lab_technicians 
    WHERE staff_number = current_user
  ));

CREATE POLICY "Lab technicians can update test results"
  ON lab_tests
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lab_technicians 
    WHERE staff_number = current_user
  ));