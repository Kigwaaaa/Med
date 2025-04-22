/*
  # Fix lab test results display

  1. Changes
    - Add trigger to sync lab test results with lab_tests table
    - Update lab test status and results when lab_test_results are added
    - Ensure proper data flow between tables

  2. Details
    - Creates trigger function to handle result synchronization
    - Adds trigger to update lab_tests table automatically
*/

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION sync_lab_test_results()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the lab_tests table with the results
  UPDATE lab_tests
  SET 
    status = 'completed',
    results = NEW.results
  WHERE id = NEW.lab_test_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_lab_test_results_trigger ON lab_test_results;

-- Create trigger to sync results
CREATE TRIGGER sync_lab_test_results_trigger
  AFTER INSERT ON lab_test_results
  FOR EACH ROW
  EXECUTE FUNCTION sync_lab_test_results();

-- Update any existing completed tests that might be out of sync
UPDATE lab_tests lt
SET 
  status = 'completed',
  results = ltr.results
FROM lab_test_results ltr
WHERE lt.id = ltr.lab_test_id
AND lt.status != 'completed';