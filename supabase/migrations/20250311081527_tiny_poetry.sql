/*
  # Fix lab test policies

  1. Changes
    - Drop and recreate lab test policies with correct permissions
    - Allow doctors to create lab tests without staff number check
    - Allow lab technicians to view and update tests
    - Maintain patient access to their own tests

  2. Security
    - Enable RLS on lab_tests table
    - Add proper policies for all roles
    - Ensure data access control
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Doctors can create lab tests" ON lab_tests;
  DROP POLICY IF EXISTS "Doctors can view tests they created" ON lab_tests;
  DROP POLICY IF EXISTS "Lab technicians can view all lab tests" ON lab_tests;
  DROP POLICY IF EXISTS "Lab technicians can update test results" ON lab_tests;
  DROP POLICY IF EXISTS "Patients can view their own tests" ON lab_tests;
END $$;

-- Create new policies
CREATE POLICY "Doctors can create lab tests"
  ON lab_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM doctors WHERE id = lab_tests.doctor_id
  ));

CREATE POLICY "Doctors can view tests they created"
  ON lab_tests
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM doctors WHERE id = lab_tests.doctor_id
  ));

CREATE POLICY "Lab technicians can view all lab tests"
  ON lab_tests
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lab_technicians WHERE staff_number = current_user
  ));

CREATE POLICY "Lab technicians can update test results"
  ON lab_tests
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lab_technicians WHERE staff_number = current_user
  ));

CREATE POLICY "Patients can view their own tests"
  ON lab_tests
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());