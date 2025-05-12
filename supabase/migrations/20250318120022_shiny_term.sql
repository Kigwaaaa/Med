/*
  # Fix lab technician authentication

  1. Changes
    - Update lab technicians table data
    - Ensure staff numbers match the application

  2. Security
    - Maintain existing RLS policies
*/

-- Update lab technicians data
DELETE FROM lab_technicians;

INSERT INTO lab_technicians (name, staff_number)
VALUES 
  ('Dr. Morris', '5678'),
  ('Dr. Angela', '0987')
ON CONFLICT (staff_number) DO UPDATE
SET name = EXCLUDED.name;

-- Ensure RLS is enabled
ALTER TABLE lab_technicians ENABLE ROW LEVEL SECURITY;

-- Recreate the policy for reading lab technician data
DROP POLICY IF EXISTS "Allow reading lab technician data" ON lab_technicians;
CREATE POLICY "Allow reading lab technician data"
  ON lab_technicians
  FOR SELECT
  TO authenticated
  USING (true);