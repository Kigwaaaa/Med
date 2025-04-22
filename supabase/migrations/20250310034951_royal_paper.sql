/*
  # Create appointments table and related functions

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references profiles.id)
      - `doctor_id` (uuid, references doctors.id)
      - `appointment_date` (timestamptz)
      - `status` (text: 'pending', 'accepted', 'rejected', 'completed')
      - `type` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on appointments table
    - Add policies for doctors to manage appointments
    - Add policies for patients to view their appointments
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  type text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  
  -- Add constraint to ensure status is valid
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'))
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Doctors can read all appointments assigned to them
CREATE POLICY "Doctors can view their appointments"
  ON appointments
  FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE staff_number = current_user
  ));

-- Doctors can update appointments assigned to them
CREATE POLICY "Doctors can update their appointments"
  ON appointments
  FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE staff_number = current_user
  ));

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
  ON appointments
  FOR SELECT
  USING (patient_id = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS appointments_doctor_id_idx ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS appointments_patient_id_idx ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);