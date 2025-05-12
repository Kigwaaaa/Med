/*
  # Set up doctor authentication

  1. Changes
    - Ensure doctors table exists with correct structure
    - Insert or update doctor records
    - Set up RLS policies for doctor authentication

  2. Security
    - Enable RLS
    - Add policies for authenticated doctors to read their own data
*/

-- First, ensure the doctors table exists and has the correct structure
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  staff_number text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Doctors can read own data" ON doctors;

-- Create policies
CREATE POLICY "Doctors can read own data"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Insert or update doctors
INSERT INTO doctors (name, email, staff_number)
VALUES 
  ('Dr Githae', 'mahugugithae@gmail.com', '1234'),
  ('Dr Mutua', 'mutuamarvin@gmail.com', '3456'),
  ('Dr Abel', 'abelmusyoka@yahoo.com', '0987'),
  ('Dr Mary', 'maryokoth@gmal.com', '5467')
ON CONFLICT (email) 
DO UPDATE SET 
  name = EXCLUDED.name,
  staff_number = EXCLUDED.staff_number;