/*
  # Fix lab test results storage and policies

  1. Changes
    - Add results column to lab_tests table
    - Create trigger function for syncing results
    - Add policies for lab technicians

  2. Security
    - Enable RLS on lab_test_results table
    - Add policies for lab technicians, doctors, and patients
*/

-- Add results column to lab_tests if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lab_tests' AND column_name = 'results'
  ) THEN
    ALTER TABLE lab_tests ADD COLUMN results text;
  END IF;
END $$;

-- Create function to handle lab test result updates
CREATE OR REPLACE FUNCTION sync_lab_test_results()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the lab_tests results column
  UPDATE lab_tests
  SET results = NEW.results,
      status = 'completed'
  WHERE id = NEW.lab_test_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync results
DROP TRIGGER IF EXISTS sync_results_trigger ON lab_test_results;
CREATE TRIGGER sync_results_trigger
AFTER INSERT ON lab_test_results
FOR EACH ROW
EXECUTE FUNCTION sync_lab_test_results();

-- Enable RLS on lab_test_results
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

-- Update lab technician policies for lab_tests table
DROP POLICY IF EXISTS "Lab technicians can update test results" ON lab_tests;
CREATE POLICY "Lab technicians can update test results"
  ON lab_tests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lab_technicians
      WHERE lab_technicians.staff_number = CURRENT_USER
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lab_technicians
      WHERE lab_technicians.staff_number = CURRENT_USER
    )
  );