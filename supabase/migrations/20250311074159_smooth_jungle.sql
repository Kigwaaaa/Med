/*
  # Add lab technicians

  1. New Data
    - Add two lab technicians:
      - Dr. Morris (staff number: 5678)
      - Dr. Angela (staff number: 0987)

  2. Security
    - Enable RLS on lab_technicians table
    - Add policy for authenticated users to read lab technician data
*/

-- Enable RLS
ALTER TABLE lab_technicians ENABLE ROW LEVEL SECURITY;

-- Add policy for reading lab technician data
CREATE POLICY "Allow reading lab technician data"
  ON lab_technicians
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert lab technicians
INSERT INTO lab_technicians (name, staff_number)
VALUES 
  ('Dr. Morris', '5678'),
  ('Dr. Angela', '0987')
ON CONFLICT (staff_number) DO NOTHING;