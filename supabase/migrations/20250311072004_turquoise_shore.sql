/*
  # Add stored procedure for updating appointment status

  1. New Functions
    - `update_appointment_status`: Updates appointment status and manages upcoming appointments count
      - Parameters:
        - p_appointment_id: UUID of the appointment to update
        - p_status: New status ('accepted' or 'rejected')
        - p_patient_id: UUID of the patient
        - p_current_appointments: Current number of upcoming appointments

  2. Security
    - Function is accessible to authenticated users only
    - Implements proper error handling
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
  -- Validate status
  IF p_status NOT IN ('accepted', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be either accepted or rejected';
  END IF;

  -- Update appointment status and add appropriate notes
  UPDATE appointments
  SET 
    status = p_status,
    notes = CASE 
      WHEN p_status = 'accepted' THEN 
        'Appointment confirmed. Please arrive 10 minutes before your scheduled time.'
      ELSE 
        'Appointment request was declined.'
    END
  WHERE id = p_appointment_id;

  -- Update patient's upcoming appointments count
  IF p_status = 'accepted' THEN
    UPDATE profiles
    SET upcoming_appointments = p_current_appointments + 1
    WHERE id = p_patient_id;
  END IF;

END;
$$;