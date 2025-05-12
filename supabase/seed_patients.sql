-- Create test accounts for all user types
BEGIN;

-- Create test patient
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (uuid_generate_v4(), 'patient1@example.com', '{"first_name": "Patient", "surname": "One", "age": 25, "gender": "Male"}')
ON CONFLICT (email) DO UPDATE
SET raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Create test doctor
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (uuid_generate_v4(), 'doctor1@example.com', '{"first_name": "Doctor", "surname": "One", "age": 40, "gender": "Male"}')
ON CONFLICT (email) DO UPDATE
SET raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Create test lab assistant
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (uuid_generate_v4(), 'lab1@example.com', '{"first_name": "Lab", "surname": "One", "age": 35, "gender": "Female"}')
ON CONFLICT (email) DO UPDATE
SET raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Insert profiles
INSERT INTO profiles (id, first_name, surname, age, gender)
SELECT 
    id,
    CASE 
        WHEN email = 'patient1@example.com' THEN 'Patient'
        WHEN email = 'doctor1@example.com' THEN 'Doctor'
        WHEN email = 'lab1@example.com' THEN 'Lab'
    END as first_name,
    'One' as surname,
    CASE 
        WHEN email = 'patient1@example.com' THEN 25
        WHEN email = 'doctor1@example.com' THEN 40
        WHEN email = 'lab1@example.com' THEN 35
    END as age,
    CASE 
        WHEN email = 'patient1@example.com' THEN 'Male'
        WHEN email = 'doctor1@example.com' THEN 'Male'
        WHEN email = 'lab1@example.com' THEN 'Female'
    END as gender
FROM auth.users
WHERE email IN ('patient1@example.com', 'doctor1@example.com', 'lab1@example.com')
ON CONFLICT (id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    surname = EXCLUDED.surname,
    age = EXCLUDED.age,
    gender = EXCLUDED.gender;

COMMIT;
