/*
  # Fix Lab Test Results Persistence

  1. Changes
    - Add trigger to sync lab test results between tables
    - Update lab test status when results are added
    - Add RLS policies for lab technicians

  2. Security
    - Enable RLS on lab_test_results table
    - Add policies for lab technicians to manage results
    - Add policies for doctors and patients to view results

  3. Notes
    - Ensures results persist between lab_tests and lab_test_results tables
    - Maintains proper access control for all user types
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_results_trigger ON lab_test_results;
DROP FUNCTION IF EXISTS sync_lab_test_results();

-- Create function to handle lab test result updates
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

-- Create trigger to sync results
CREATE TRIGGER sync_results_trigger
AFTER INSERT ON lab_test_results
FOR EACH ROW
EXECUTE FUNCTION sync_lab_test_results();

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