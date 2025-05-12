/*
  # Add Lab Technicians Table and Initial Data

  1. New Tables
    - `lab_technicians`
      - `id` (uuid, primary key)
      - `name` (text)
      - `staff_number` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `lab_technicians` table
    - Add policies for lab technicians to view lab tests
*/

-- Create lab technicians table
CREATE TABLE IF NOT EXISTS lab_technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  staff_number text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lab_technicians ENABLE ROW LEVEL SECURITY;

-- Insert initial lab technicians
INSERT INTO lab_technicians (name, staff_number) VALUES
  ('Dr Morris', '5678'),
  ('Dr Angela', '0987');

-- Add policies for lab technicians
CREATE POLICY "Lab technicians can view all lab tests"
  ON lab_tests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lab_technicians
      WHERE staff_number = CURRENT_USER
    )
  );