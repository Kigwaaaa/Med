export interface Profile {
  id: string;
  first_name: string;
  surname: string;
  age: number;
  gender: string;
  created_at: string;
  updated_at: string;
  upcoming_appointments: number;
}

export interface Doctor {
  id: string;
  staff_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  type: string;
  notes?: string;
  created_at: string;
  // Join with profiles
  patient?: Profile;
}

export interface LabTest {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  test_type: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  results?: string;
}

export interface LabTechnician {
  id: string;
  name: string;
  staff_number: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at'>;
        Update: Partial<Omit<Appointment, 'id' | 'created_at'>>;
      };
      lab_technicians: {
        Row: LabTechnician;
        Insert: Omit<LabTechnician, 'id' | 'created_at'>;
        Update: Partial<Omit<LabTechnician, 'id' | 'created_at'>>;
      };
    };
  };
}