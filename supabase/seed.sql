-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS lab_technicians CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create doctors table with RLS
create table doctors (
    id uuid default uuid_generate_v4() primary key,
    staff_number text unique not null,
    first_name text not null,
    last_name text not null,
    email text unique not null,
    phone text,
    department text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    CONSTRAINT unique_doctor_email UNIQUE (email)
);

-- Create lab_technicians table with RLS
create table lab_technicians (
    id uuid default uuid_generate_v4() primary key,
    staff_number text unique not null,
    first_name text not null,
    last_name text not null,
    email text unique not null,
    phone text,
    department text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    CONSTRAINT unique_lab_email UNIQUE (email)
);

-- Create profiles table with RLS
create table profiles (
    id uuid references auth.users on delete cascade unique primary key,
    first_name text,
    surname text,
    age integer,
    gender text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table doctors enable row level security;
alter table lab_technicians enable row level security;
alter table profiles enable row level security;

-- Create RLS policies
create policy "Public doctors are viewable by everyone."
    on doctors for select
    using ( true );

create policy "Public lab_technicians are viewable by everyone."
    on lab_technicians for select
    using ( true );

-- Create RLS policies for profiles table
create policy "Users can view their own profile."
    on profiles for select
    using ( auth.uid() = id );

create policy "Users can insert their own profile."
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update their own profile."
    on profiles for update
    using ( auth.uid() = id );

-- Add unique constraint to auth.users email if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_email'
    ) THEN
        ALTER TABLE auth.users 
        ADD CONSTRAINT unique_user_email UNIQUE (email);
    END IF;
END $$;

-- Insert sample data
-- Insert sample doctors
insert into doctors (staff_number, first_name, last_name, email, phone, department)
values
    ('DOC101', 'John', 'Doe', 'john.doe@example.com', '+1234567890', 'Cardiology'),
    ('DOC102', 'Jane', 'Smith', 'jane.smith@example.com', '+0987654321', 'Pediatrics');

-- Insert sample lab technicians
insert into lab_technicians (staff_number, first_name, last_name, email, phone, department)
values
    ('LAB101', 'Mike', 'Johnson', 'mike.johnson@example.com', '+1122334455', 'Clinical'),
    ('LAB102', 'Sarah', 'Williams', 'sarah.williams@example.com', '+5544332211', 'Microbiology');
