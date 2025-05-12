/*
  # Fix lab technician authentication

  1. Changes
    - Update lab technician policies to use staff_number correctly
    - Ensure proper access control for lab technicians
    - Fix policy checks for lab test results

  2. Security
    - Maintain RLS on all tables
    - Update policies to use correct authentication checks
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Lab technicians can create results" ON lab_test_results;
DROP POLICY IF EXISTS "Lab technicians can read all results" ON lab_test_results;
DROP POLICY IF EXISTS "Lab technicians can update test results" ON lab_tests;
DROP POLICY IF EXISTS "Lab technicians can view all lab tests" ON lab_tests;

-- Create updated policies for lab technicians
CREATE POLICY "Lab technicians can create results"
ON lab_test_results
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lab_technicians
    WHERE lab_technicians.staff_number = current_user
  )
);

CREATE POLICY "Lab technicians can read all results"
ON lab_test_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lab_technicians
    WHERE lab_technicians.staff_number = current_user
  )
);

CREATE POLICY "Lab technicians can view all lab tests"
ON lab_tests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lab_technicians
    WHERE lab_technicians.staff_number = current_user
  )
);

CREATE POLICY "Lab technicians can update test results"
ON lab_tests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lab_technicians
    WHERE lab_technicians.staff_number = current_user
  )
);