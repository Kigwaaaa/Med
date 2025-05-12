/*
  # Add lab results tracking table

  1. New Tables
    - `lab_test_results`
      - `id` (uuid, primary key)
      - `lab_test_id` (uuid, references lab_tests)
      - `technician_id` (uuid, references lab_technicians)
      - `results` (text)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `lab_test_results` table
    - Add policies for lab technicians to create and read results
    - Add policies for doctors to read results
    - Add policies for patients to read their own results

  3. Changes
    - Add foreign key constraints to ensure data integrity
    - Add indexes for performance optimization
*/

-- Create lab test results table
CREATE TABLE IF NOT EXISTS lab_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_test_id uuid NOT NULL REFERENCES lab_tests(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL REFERENCES lab_technicians(id) ON DELETE CASCADE,
  results text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS lab_test_results_lab_test_id_idx ON lab_test_results(lab_test_id);
CREATE INDEX IF NOT EXISTS lab_test_results_technician_id_idx ON lab_test_results(technician_id);
CREATE INDEX IF NOT EXISTS lab_test_results_completed_at_idx ON lab_test_results(completed_at);

-- Enable RLS
ALTER TABLE lab_test_results ENABLE ROW LEVEL SECURITY;

-- Policies for lab technicians
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

-- Policies for doctors
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

-- Policies for patients
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