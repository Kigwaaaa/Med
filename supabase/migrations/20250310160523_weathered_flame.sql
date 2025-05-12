/*
  # Update appointment status handling

  1. Changes
    - Add trigger to handle appointment status updates
    - Automatically update patient's upcoming_appointments count
    - Validate appointment status values

  2. Security
    - Maintain existing RLS policies
    - Ensure data consistency
*/

-- Function to handle appointment status changes
CREATE OR REPLACE FUNCTION handle_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Increment upcoming_appointments count
    UPDATE profiles 
    SET upcoming_appointments = upcoming_appointments + 1
    WHERE id = NEW.patient_id;
  
  -- If status was 'accepted' and is being changed to something else
  ELSIF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    -- Decrement upcoming_appointments count
    UPDATE profiles 
    SET upcoming_appointments = GREATEST(0, upcoming_appointments - 1)
    WHERE id = NEW.patient_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for appointment status changes
DROP TRIGGER IF EXISTS appointment_status_change ON appointments;
CREATE TRIGGER appointment_status_change
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_status_change();

-- Add constraint to validate status values if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_status_check'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_status_check
    CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed'));
  END IF;
END $$;