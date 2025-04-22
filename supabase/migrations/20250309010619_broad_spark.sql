/*
  # Create doctors authentication table and policies

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `staff_number` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `doctors` table
    - Add policies for authentication and data access
*/

-- Create doctors table if it doesn't exist
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  staff_number text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to doctors"
  ON doctors
  FOR SELECT
  TO public
  USING (true);

-- Insert initial doctors data
INSERT INTO doctors (name, email, staff_number)
VALUES 
  ('Dr Githae', 'mahugugithae@gmail.com', '1234'),
  ('Dr Mutua', 'mutuamarvin@gmail.com', '3456'),
  ('Dr Abel', 'abelmusyoka@yahoo.com', '0987'),
  ('Dr Mary', 'maryokoth@gmal.com', '5467')
ON CONFLICT (email) DO NOTHING;