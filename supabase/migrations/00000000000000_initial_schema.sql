-- Create doctors table
create table doctors (
  id uuid default uuid_generate_v4() primary key,
  staff_number text unique not null,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create lab_technicians table
create table lab_technicians (
  id uuid default uuid_generate_v4() primary key,
  staff_number text unique not null,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create medical_records table
create table medical_records (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid not null,
  doctor_id uuid references doctors(id),
  lab_tech_id uuid references lab_technicians(id),
  diagnosis text,
  treatment text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create appointments table
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid not null,
  doctor_id uuid references doctors(id),
  lab_tech_id uuid references lab_technicians(id),
  appointment_date timestamp with time zone not null,
  status text not null default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
