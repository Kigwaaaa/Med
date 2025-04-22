/*
  # Update appointments table policies

  1. Security Changes
    - Enable RLS on appointments table
    - Add policies for:
      - Patients to insert their own appointments
      - Patients to view their own appointments
      - Doctors to view appointments assigned to them
      - Doctors to update appointments assigned to them

  2. Notes
    - Patients can only create and view their own appointments
    - Doctors can view and update appointments where they are the assigned doctor
    - Status changes are restricted to valid values through check constraint
*/

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow patients to insert their own appointments
CREATE POLICY "Patients can create their own appointments"
ON appointments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

-- Allow patients to view their own appointments
CREATE POLICY "Patients can view their own appointments"
ON appointments
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

-- Allow doctors to view appointments assigned to them
CREATE POLICY "Doctors can view their assigned appointments"
ON appointments
FOR SELECT
TO authenticated
USING (doctor_id IN (
  SELECT id FROM doctors WHERE staff_number = CURRENT_USER
));

-- Allow doctors to update appointments assigned to them
CREATE POLICY "Doctors can update their assigned appointments"
ON appointments
FOR UPDATE
TO authenticated
USING (doctor_id IN (
  SELECT id FROM doctors WHERE staff_number = CURRENT_USER
));