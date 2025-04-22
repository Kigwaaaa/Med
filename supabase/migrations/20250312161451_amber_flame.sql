/*
  # Fix doctor appointments visibility

  1. Changes
    - Drop existing doctor-related policies
    - Create new policies with correct staff number check
    - Add policy for public doctor data access
    - Update appointment status check constraint

  2. Security
    - Maintain RLS on appointments table
    - Ensure doctors can only see their own appointments
    - Allow proper status updates
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON appointments;

-- Create new policies for doctors with proper staff number check
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
);

-- Add policy for public doctor data access if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'doctors' 
    AND policyname = 'Allow public read access to doctors'
  ) THEN
    CREATE POLICY "Allow public read access to doctors"
    ON doctors
    FOR SELECT
    TO public
    USING (true);
  END IF;
END $$;

-- Update appointment status constraint to ensure proper values
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments
ADD CONSTRAINT appointments_status_check
CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed'));