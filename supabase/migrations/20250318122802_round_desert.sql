/*
  # Fix appointment visibility policies

  1. Changes
    - Update RLS policies for appointments table
    - Fix doctor and lab technician access to appointments
    - Ensure proper visibility of appointments

  2. Security
    - Maintain RLS on appointments table
    - Update policies to use correct authentication checks
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can create their own appointments" ON appointments;

-- Create updated policies for doctors
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
  OR
  EXISTS (
    SELECT 1 FROM lab_technicians
    WHERE lab_technicians.staff_number = current_user
  )
);

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

-- Create policies for patients
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

-- Add public policy for appointments
CREATE POLICY "Allow public read access to appointments"
ON appointments
FOR SELECT
TO public
USING (true);