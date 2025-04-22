/*
  # Fix lab technician authentication

  1. Changes
    - Recreate lab technicians with correct staff numbers
    - Add policy for public access to lab technician data
    - Ensure proper RLS setup

  2. Security
    - Enable RLS on lab_technicians table
    - Add policy for reading lab technician data
*/

-- First drop existing data and policies
TRUNCATE lab_technicians;
DROP POLICY IF EXISTS "Allow reading lab technician data" ON lab_technicians;

-- Insert lab technicians
INSERT INTO lab_technicians (name, staff_number)
VALUES 
  ('Dr. Morris', '5678'),
  ('Dr. Angela', '0987');

-- Enable RLS
ALTER TABLE lab_technicians ENABLE ROW LEVEL SECURITY;

-- Add policy for reading lab technician data
CREATE POLICY "Allow reading lab technician data"
  ON lab_technicians
  FOR SELECT
  TO public
  USING (true);