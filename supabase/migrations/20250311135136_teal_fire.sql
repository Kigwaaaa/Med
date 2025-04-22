/*
  # Fix Lab Test Results Persistence and Policies

  1. Changes
    - Add results column to lab_tests table
    - Create sync function for lab test results
    - Drop existing policies to avoid conflicts
    - Recreate RLS policies with proper permissions

  2. Security
    - Lab technicians can create and read results
    - Doctors can view results for their patients
    - Patients can view their own results

  3. Notes
    - Ensures results persist after page refresh
    - Maintains proper access control
    - Avoids policy conflicts by dropping existing policies first
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

-- Create or replace the sync function
CREATE OR REPLACE FUNCTION sync_lab_test_results()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the lab_tests status and results
  UPDATE lab_tests
  SET 
    status = 'completed',
    results = NEW.results
  WHERE id = NEW.lab_test_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS sync_results_trigger ON lab_test_results;

-- Create trigger to sync results
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

-- Create policies for lab technicians
CREATE POLICY "Lab technicians can create results" ON lab_test_results
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lab_technicians
    WHERE lab_technicians.staff_number = CURRENT_USER
  )
);

CREATE POLICY "Lab technicians can read all results" ON lab_test_results
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lab_technicians
    WHERE lab_technicians.staff_number = CURRENT_USER
  )
);

-- Create policies for doctors
CREATE POLICY "Doctors can read results for their patients" ON lab_test_results
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lab_tests
    JOIN doctors ON doctors.id = lab_tests.doctor_id
    WHERE lab_tests.id = lab_test_results.lab_test_id
    AND doctors.staff_number = CURRENT_USER
  )
);

-- Create policies for patients
CREATE POLICY "Patients can read their own results" ON lab_test_results
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lab_tests
    WHERE lab_tests.id = lab_test_results.lab_test_id
    AND lab_tests.patient_id = auth.uid()
  )
);