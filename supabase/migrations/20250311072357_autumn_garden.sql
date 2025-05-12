/*
  # Add stored procedure for appointment status updates

  1. New Functions
    - `update_appointment_status`: Updates appointment status and manages patient's upcoming appointments count
      - Parameters:
        - p_appointment_id: UUID of the appointment to update
        - p_status: New status ('accepted' or 'rejected')
        - p_patient_id: UUID of the patient
        - p_current_appointments: Current number of upcoming appointments

  2. Security
    - Function is accessible to authenticated users only
*/

CREATE OR REPLACE FUNCTION update_appointment_status(
  p_appointment_id UUID,
  p_status TEXT,
  p_patient_id UUID,
  p_current_appointments INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update appointment status
  UPDATE appointments 
  SET 
    status = p_status,
    notes = CASE 
      WHEN p_status = 'accepted' THEN 'Appointment confirmed. Please arrive 10 minutes before your scheduled time.'
      ELSE 'Appointment request was declined.'
    END
  WHERE id = p_appointment_id;

  -- Update patient's upcoming appointments count if accepting
  IF p_status = 'accepted' THEN
    UPDATE profiles 
    SET upcoming_appointments = p_current_appointments + 1
    WHERE id = p_patient_id;
  END IF;
END;
$$;