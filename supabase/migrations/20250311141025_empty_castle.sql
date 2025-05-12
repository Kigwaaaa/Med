/*
  # Update lab test results structure

  1. Changes
    - Drop existing lab_test_results table
    - Recreate lab_test_results table with integer IDs
    - Add necessary indexes and constraints
    - Update RLS policies

  2. Security
    - Enable RLS on lab_test_results table
    - Add policies for lab technicians, doctors, and patients
*/

-- Drop existing table and its dependencies
DROP TABLE IF EXISTS lab_test_results CASCADE;

-- Create new lab_test_results table with integer ID
CREATE TABLE lab_test_results (
  id SERIAL PRIMARY KEY,
  lab_test_id uuid REFERENCES lab_tests(id) ON DELETE CASCADE,
  technician_id text REFERENCES lab_technicians(staff_number) ON DELETE CASCADE,
  results text NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX lab_test_results_lab_test_id_idx ON lab_test_results(lab_test_id);
CREATE INDEX lab_test_results_technician_id_idx ON lab_test_results(technician_id);
CREATE INDEX lab_test_results_completed_at_idx ON lab_test_results(completed_at);

-- Enable RLS
ALTER TABLE lab_test_results ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create or replace sync function
CREATE OR REPLACE FUNCTION sync_lab_test_results()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lab_tests
  SET 
    results = NEW.results,
    status = 'completed'
  WHERE id = NEW.lab_test_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;