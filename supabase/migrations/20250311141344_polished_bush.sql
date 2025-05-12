/*
  # Add lab test status trigger

  1. Changes
    - Create trigger to automatically update lab test status when results are added
    - Ensure lab test status is updated to 'completed' when results are submitted

  2. Details
    - Creates a trigger function to handle status updates
    - Adds trigger to lab_test_results table
    - Maintains data consistency between lab_tests and lab_test_results
*/

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_lab_test_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the lab test status to completed
  UPDATE lab_tests
  SET 
    status = 'completed',
    results = NEW.results
  WHERE id = NEW.lab_test_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_lab_test_status_trigger ON lab_test_results;

-- Create the trigger
CREATE TRIGGER update_lab_test_status_trigger
  AFTER INSERT ON lab_test_results
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_test_status();