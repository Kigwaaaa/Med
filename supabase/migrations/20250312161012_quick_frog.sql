/*
  # Fix doctor appointments policies

  1. Changes
    - Drop existing doctor-related policies
    - Add new policies for doctors to:
      - View all appointments assigned to them
      - Update appointments assigned to them
    - Add index on doctor_id for better performance

  2. Security
    - Enable RLS
    - Ensure doctors can only access their own appointments
*/

-- Drop existing doctor-related policies
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view their assigned appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their assigned appointments" ON appointments;

-- Create new policies for doctors
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
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.id = appointments.doctor_id
    AND doctors.staff_number = current_user
  )
);

-- Create index for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS appointments_doctor_id_idx ON appointments(doctor_id);