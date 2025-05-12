/*
  # Update lab test results policies

  1. Security
    - Enable RLS on lab_test_results table if not already enabled
    - Add policies for:
      - Lab technicians can create results
      - Lab technicians can read all results
      - Doctors can read results for their patients
      - Patients can read their own results

  2. Changes
    - Safely enable RLS
    - Add policies only if they don't exist
*/

-- Safely enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'lab_test_results' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE lab_test_results ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create policies only if they don't exist
DO $$ 
BEGIN
  -- Lab technicians can create results
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lab_test_results' 
    AND policyname = 'Lab technicians can create results'
  ) THEN
    CREATE POLICY "Lab technicians can create results"
      ON lab_test_results
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM lab_technicians
          WHERE lab_technicians.id = lab_test_results.technician_id
        )
      );
  END IF;

  -- Lab technicians can read all results
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lab_test_results' 
    AND policyname = 'Lab technicians can read all results'
  ) THEN
    CREATE POLICY "Lab technicians can read all results"
      ON lab_test_results
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM lab_technicians
          WHERE lab_technicians.id = lab_test_results.technician_id
        )
      );
  END IF;

  -- Doctors can read results for their patients
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lab_test_results' 
    AND policyname = 'Doctors can read results for their patients'
  ) THEN
    CREATE POLICY "Doctors can read results for their patients"
      ON lab_test_results
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM lab_tests
          JOIN doctors ON doctors.id = lab_tests.doctor_id
          WHERE lab_tests.id = lab_test_results.lab_test_id
        )
      );
  END IF;

  -- Patients can read their own results
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lab_test_results' 
    AND policyname = 'Patients can read their own results'
  ) THEN
    CREATE POLICY "Patients can read their own results"
      ON lab_test_results
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM lab_tests
          WHERE lab_tests.id = lab_test_results.lab_test_id
          AND lab_tests.patient_id = auth.uid()
        )
      );
  END IF;
END $$;