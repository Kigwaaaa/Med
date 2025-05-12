/*
  # Add Lab Tests Table

  1. New Tables
    - `lab_tests`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, references appointments)
      - `doctor_id` (uuid, references doctors)
      - `patient_id` (uuid, references profiles)
      - `test_type` (text)
      - `description` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `results` (text, nullable)

  2. Security
    - Enable RLS on `lab_tests` table
    - Add policies for doctors to create and read tests
    - Add policies for patients to read their own tests
*/

-- Create lab tests table
CREATE TABLE IF NOT EXISTS lab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  test_type text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  results text,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;

-- Policies for doctors
CREATE POLICY "Doctors can create lab tests"
  ON lab_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM doctors WHERE staff_number = CURRENT_USER
    )
  );

CREATE POLICY "Doctors can view tests they created"
  ON lab_tests
  FOR SELECT
  TO authenticated
  USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE staff_number = CURRENT_USER
    )
  );

-- Policies for patients
CREATE POLICY "Patients can view their own tests"
  ON lab_tests
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());