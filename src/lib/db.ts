import { LocalStorageService } from './local-storage';

export const db = LocalStorageService.getInstance();

// Create initial tables if they don't exist
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([]));
}
if (!localStorage.getItem('appointments')) {
  localStorage.setItem('appointments', JSON.stringify([]));
}
if (!localStorage.getItem('medical_records')) {
  localStorage.setItem('medical_records', JSON.stringify([]));
}
if (!localStorage.getItem('notifications')) {
  localStorage.setItem('notifications', JSON.stringify([]));
}

// Initialize staff data if not exists
if (!localStorage.getItem('doctors')) {
  localStorage.setItem('doctors', JSON.stringify([
    {
      id: 'doc1',
      staff_number: 'DOC123',
      name: 'Dr. John Smith',
      specialization: 'General Practitioner',
      created_at: new Date().toISOString()
    }
  ]));
}

if (!localStorage.getItem('lab_technicians')) {
  localStorage.setItem('lab_technicians', JSON.stringify([
    {
      id: 'lab1',
      staff_number: 'LAB456',
      name: 'Sarah Johnson',
      created_at: new Date().toISOString()
    }
  ]));
}