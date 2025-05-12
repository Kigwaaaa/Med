import { v4 as uuidv4 } from 'uuid';
import type { Profile, Doctor, Appointment, LabTest, LabTechnician } from '../types/database';

// Helper function to get data from localStorage
const getData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper function to save data to localStorage
const saveData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Profiles
export const getProfiles = (): Profile[] => getData<Profile>('profiles');
export const saveProfile = (profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Profile => {
  const profiles = getProfiles();
  const newProfile: Profile = {
    ...profile,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    upcoming_appointments: 0,
  };
  saveData('profiles', [...profiles, newProfile]);
  return newProfile;
};

// Doctors
export const getDoctors = (): Doctor[] => getData<Doctor>('doctors');
export const saveDoctor = (doctor: Omit<Doctor, 'id' | 'created_at'>): Doctor => {
  const doctors = getDoctors();
  const newDoctor: Doctor = {
    ...doctor,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };
  saveData('doctors', [...doctors, newDoctor]);
  return newDoctor;
};

// Appointments
export const getAppointments = (): Appointment[] => getData<Appointment>('appointments');
export const saveAppointment = (appointment: Omit<Appointment, 'id' | 'created_at'>): Appointment => {
  const appointments = getAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };
  saveData('appointments', [...appointments, newAppointment]);
  return newAppointment;
};

// Lab Tests
export const getLabTests = (): LabTest[] => getData<LabTest>('labTests');
export const saveLabTest = (labTest: Omit<LabTest, 'id' | 'created_at'>): LabTest => {
  const labTests = getLabTests();
  const newLabTest: LabTest = {
    ...labTest,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };
  saveData('labTests', [...labTests, newLabTest]);
  return newLabTest;
};

// Lab Technicians
export const getLabTechnicians = (): LabTechnician[] => getData<LabTechnician>('labTechnicians');
export const saveLabTechnician = (technician: Omit<LabTechnician, 'id' | 'created_at'>): LabTechnician => {
  const technicians = getLabTechnicians();
  const newTechnician: LabTechnician = {
    ...technician,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };
  saveData('labTechnicians', [...technicians, newTechnician]);
  return newTechnician;
};

// Initialize localStorage with empty arrays if they don't exist
export const initializeLocalStorage = () => {
  const keys = ['profiles', 'doctors', 'appointments', 'labTests', 'labTechnicians'];
  keys.forEach(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
}; 