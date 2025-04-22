/*
  # Update appointments policies safely

  1. Changes
    - Safely remove and recreate policies for appointments
    - Ensure patients can only see their own appointments
    - Maintain doctor access to their assigned appointments

  2. Security
    - Enable RLS on appointments table
    - Add policies for:
      - Patient appointment creation
      - Patient appointment viewing
      - Doctor appointment management
*/

-- Ensure RLS is enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Safely handle policy creation
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Patients can create their own appointments'
  ) THEN
    DROP POLICY "Patients can create their own appointments" ON appointments;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Patients can view their own appointments'
  ) THEN
    DROP POLICY "Patients can view their own appointments" ON appointments;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Doctors can update their appointments'
  ) THEN
    DROP POLICY "Doctors can update their appointments" ON appointments;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Doctors can update their assigned appointments'
  ) THEN
    DROP POLICY "Doctors can update their assigned appointments" ON appointments;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Doctors can view their appointments'
  ) THEN
    DROP POLICY "Doctors can view their appointments" ON appointments;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Doctors can view their assigned appointments'
  ) THEN
    DROP POLICY "Doctors can view their assigned appointments" ON appointments;
  END IF;

  -- Create new policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Patients can create their own appointments'
  ) THEN
    CREATE POLICY "Patients can create their own appointments"
    ON appointments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = patient_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Patients can view their own appointments'
  ) THEN
    CREATE POLICY "Patients can view their own appointments"
    ON appointments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = patient_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Doctors can view their assigned appointments'
  ) THEN
    CREATE POLICY "Doctors can view their assigned appointments"
    ON appointments
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM doctors
        WHERE doctors.id = appointments.doctor_id
        AND doctors.staff_number = CURRENT_USER
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Doctors can update their assigned appointments'
  ) THEN
    CREATE POLICY "Doctors can update their assigned appointments"
    ON appointments
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM doctors
        WHERE doctors.id = appointments.doctor_id
        AND doctors.staff_number = CURRENT_USER
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM doctors
        WHERE doctors.id = appointments.doctor_id
        AND doctors.staff_number = CURRENT_USER
      )
    );
  END IF;
END $$;