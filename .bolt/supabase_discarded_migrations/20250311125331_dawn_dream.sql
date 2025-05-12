/*
  # Enable RLS for lab test results table

  1. Security Changes
    - Enable RLS on lab_test_results table
    - Add policies for lab technicians to create and read results
    - Add policies for doctors to read their patients' results
    - Add policies for patients to read their own results

  2. Notes
    - Lab technicians can create and read all results
    - Doctors can only read results for their patients
    - Patients can only read their own results
*/

-- Enable RLS
ALTER TABLE lab_test_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Lab technicians can create results" ON lab_test_results;
DROP POLICY IF EXISTS "Lab technicians can read all results" ON lab_test_results;
DROP POLICY IF EXISTS "Doctors can read results for their patients" ON lab_test_results;
DROP POLICY IF EXISTS "Patients can read their own results" ON lab_test_results;

-- Create new policies
CREATE POLICY "Lab technicians can create results"
  ON lab_test_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lab_technicians
      WHERE lab_technicians.staff_number = CURRENT_USER
    )
  );

CREATE POLICY "Lab technicians can read all results"
  ON lab_test_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lab_technicians
      WHERE lab_technicians.staff_number = CURRENT_USER
    )
  );

CREATE POLICY "Doctors can read results for their patients"
  ON lab_test_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lab_tests
      JOIN doctors ON doctors.id = lab_tests.doctor_id
      WHERE lab_tests.id = lab_test_results.lab_test_id
      AND doctors.staff_number = CURRENT_USER
    )
  );

CREATE POLICY "Patients can read their own results"
  ON lab_test_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lab_tests
      WHERE lab_tests.id = lab_test_results.lab_test_id
      AND lab_tests.patient_id = auth.uid()
    )
  );