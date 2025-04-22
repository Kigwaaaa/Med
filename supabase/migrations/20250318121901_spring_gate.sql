/*
  # Fix lab technician data and policies

  1. Changes
    - Update lab technicians data safely
    - Add policy for reading lab technician data
    - Handle foreign key constraints properly

  2. Security
    - Enable RLS on lab_technicians table
    - Add policy for authenticated access
*/

-- Update lab technicians data safely using ON CONFLICT
INSERT INTO lab_technicians (name, staff_number)
VALUES 
  ('Dr. Morris', '5678'),
  ('Dr. Angela', '0987')
ON CONFLICT (staff_number) DO UPDATE
SET name = EXCLUDED.name;

-- Enable RLS
ALTER TABLE lab_technicians ENABLE ROW LEVEL SECURITY;

-- Add policy for reading lab technician data
DROP POLICY IF EXISTS "Allow reading lab technician data" ON lab_technicians;
CREATE POLICY "Allow reading lab technician data"
  ON lab_technicians
  FOR SELECT
  TO authenticated
  USING (true);