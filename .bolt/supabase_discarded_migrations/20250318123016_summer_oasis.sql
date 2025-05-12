/*
  # Fix appointment visibility

  1. Changes
    - Disable and re-enable RLS to ensure clean state
    - Update policies for proper appointment visibility
    - Add necessary indexes for performance

  2. Security
    - Maintain proper access control
    - Ensure correct visibility for each role
*/

-- First disable and re-enable RLS to ensure clean state
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can create their own appointments" ON appointments;
DROP POLICY IF EXISTS "Allow public read access to appointments" ON appointments;

-- Create policy for doctors to view appointments
CREATE POLICY "Doctors can view their appointments"
ON appointments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.id = appointments.doctor_id
    AND doctors.staff_number = current_user
  )
);

-- Create policy for doctors to update appointments
CREATE POLICY "Doctors can update their appointments"
ON appointments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.id = appointments.doctor_id
    AND doctors.staff_number = current_user
  )
);

-- Create policy for lab technicians to view appointments
CREATE POLICY "Lab technicians can view appointments"
ON appointments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lab_technicians
    WHERE lab_technicians.staff_number = current_user
  )
);

-- Create policy for patients
CREATE POLICY "Patients can create their own appointments"
ON appointments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view own appointments"
ON appointments
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

-- Refresh indexes for better performance
DROP INDEX IF EXISTS appointments_doctor_id_idx;
DROP INDEX IF EXISTS appointments_patient_id_idx;
CREATE INDEX appointments_doctor_id_idx ON appointments(doctor_id);
CREATE INDEX appointments_patient_id_idx ON appointments(patient_id);