-- Create test doctors with staff numbers
BEGIN;

-- Insert doctors with ON CONFLICT
INSERT INTO doctors (staff_number, first_name, last_name, email, phone, department)
VALUES
  ('DOC101', 'Doctor', 'One', 'doctor1@example.com', '+1234567890', 'General Practice'),
  ('DOC102', 'Doctor', 'Two', 'doctor2@example.com', '+0987654321', 'Cardiology'),
  ('DOC103', 'Doctor', 'Three', 'doctor3@example.com', '+1122334455', 'Pediatrics')
ON CONFLICT (staff_number) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    department = EXCLUDED.department;

-- Insert lab technicians with ON CONFLICT
INSERT INTO lab_technicians (staff_number, first_name, last_name, email, phone, department)
VALUES
  ('LAB101', 'Lab', 'One', 'lab1@example.com', '+1122334455', 'Clinical'),
  ('LAB102', 'Lab', 'Two', 'lab2@example.com', '+5544332211', 'Microbiology'),
  ('LAB103', 'Lab', 'Three', 'lab3@example.com', '+4455667788', 'Pathology')
ON CONFLICT (staff_number) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    department = EXCLUDED.department;

COMMIT;
