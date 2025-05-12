/*
  # Create doctors table and add initial data

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `staff_number` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `doctors` table
    - Add policy for authenticated users to read doctor data

  3. Initial Data
    - Insert four doctors with their details
*/

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  staff_number text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading doctor data
CREATE POLICY "Allow reading doctor data"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial doctors
INSERT INTO doctors (name, email, staff_number)
VALUES 
  ('Dr Githae', 'mahugugithae@gmail.com', '1234'),
  ('Dr Mutua', 'mutuamarvin@gmail.com', '3456'),
  ('Dr Abel', 'abelmusyoka@yahoo.com', '0987'),
  ('Dr Mary', 'maryokoth@gmal.com', '5467')
ON CONFLICT (email) DO NOTHING;