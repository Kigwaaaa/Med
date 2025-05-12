// Types
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  surname: string;
  age: number;
  gender: string;
  role: 'patient' | 'doctor' | 'lab_assistant' | 'nurse' | 'pharmacist';
  staff_number?: string;
  department?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// Local Storage Keys
const KEYS = {
  USERS: 'neemamed_users',
  MEDICAL_RECORDS: 'neemamed_medical_records',
  APPOINTMENTS: 'neemamed_appointments',
  NOTIFICATIONS: 'neemamed_notifications',
};

// Helper functions
const getItem = <T>(key: string): T[] => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : [];
};

const setItem = <T>(key: string, value: T[]): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize demo data if not exists
const initializeDemoData = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    const demoUsers: User[] = [
      {
        id: 'pat1',
        email: 'demo@example.com',
        password: 'demo123',
        firstName: 'Demo',
        surname: 'User',
        age: 30,
        gender: 'male',
        role: 'patient'
      },
      {
        id: 'doc1',
        email: 'doctor@example.com',
        password: 'doctor123',
        firstName: 'Sarah',
        surname: 'Johnson',
        age: 35,
        gender: 'female',
        role: 'doctor',
        staff_number: 'DOC123',
        department: 'General Practice'
      },
      {
        id: 'lab1',
        email: 'lab@example.com',
        password: 'lab123',
        firstName: 'Michael',
        surname: 'Chen',
        age: 40,
        gender: 'male',
        role: 'lab_assistant',
        staff_number: 'LAB456',
        department: 'Laboratory'
      }
    ];
    setItem(KEYS.USERS, demoUsers);
  }
};

// Initialize demo data
initializeDemoData();

// Database operations
export const db = {
  // User operations
  users: {
    getAll: () => getItem<User>(KEYS.USERS),
    getById: (id: string) => getItem<User>(KEYS.USERS).find(user => user.id === id),
    getByEmail: (email: string) => getItem<User>(KEYS.USERS).find(user => user.email === email),
    create: (user: Omit<User, 'id'>) => {
      const users = getItem<User>(KEYS.USERS);
      const newUser = { ...user, id: `user_${Date.now()}` };
      setItem(KEYS.USERS, [...users, newUser]);
      return { data: newUser, error: null };
    },
    update: (id: string, updates: Partial<User>) => {
      const users = getItem<User>(KEYS.USERS);
      const index = users.findIndex(user => user.id === id);
      if (index === -1) return { error: 'User not found' };
      users[index] = { ...users[index], ...updates };
      setItem(KEYS.USERS, users);
      return { data: users[index], error: null };
    },
    delete: (id: string) => {
      const users = getItem<User>(KEYS.USERS);
      setItem(KEYS.USERS, users.filter(user => user.id !== id));
      return { error: null };
    }
  },

  // Medical Records operations
  medicalRecords: {
    getAll: () => getItem<MedicalRecord>(KEYS.MEDICAL_RECORDS),
    getByPatientId: (patientId: string) => 
      getItem<MedicalRecord>(KEYS.MEDICAL_RECORDS).filter(record => record.patientId === patientId),
    create: (record: Omit<MedicalRecord, 'id'>) => {
      const records = getItem<MedicalRecord>(KEYS.MEDICAL_RECORDS);
      const newRecord = { ...record, id: `record_${Date.now()}` };
      setItem(KEYS.MEDICAL_RECORDS, [...records, newRecord]);
      return { data: newRecord, error: null };
    },
    update: (id: string, updates: Partial<MedicalRecord>) => {
      const records = getItem<MedicalRecord>(KEYS.MEDICAL_RECORDS);
      const index = records.findIndex(record => record.id === id);
      if (index === -1) return { error: 'Record not found' };
      records[index] = { ...records[index], ...updates };
      setItem(KEYS.MEDICAL_RECORDS, records);
      return { data: records[index], error: null };
    }
  },

  // Appointments operations
  appointments: {
    getAll: () => getItem<Appointment>(KEYS.APPOINTMENTS),
    getByPatientId: (patientId: string) => 
      getItem<Appointment>(KEYS.APPOINTMENTS).filter(appointment => appointment.patientId === patientId),
    getByDoctorId: (doctorId: string) => 
      getItem<Appointment>(KEYS.APPOINTMENTS).filter(appointment => appointment.doctorId === doctorId),
    create: (appointment: Omit<Appointment, 'id'>) => {
      const appointments = getItem<Appointment>(KEYS.APPOINTMENTS);
      const newAppointment = { ...appointment, id: `appointment_${Date.now()}` };
      setItem(KEYS.APPOINTMENTS, [...appointments, newAppointment]);
      return { data: newAppointment, error: null };
    },
    update: (id: string, updates: Partial<Appointment>) => {
      const appointments = getItem<Appointment>(KEYS.APPOINTMENTS);
      const index = appointments.findIndex(appointment => appointment.id === id);
      if (index === -1) return { error: 'Appointment not found' };
      appointments[index] = { ...appointments[index], ...updates };
      setItem(KEYS.APPOINTMENTS, appointments);
      return { data: appointments[index], error: null };
    }
  },

  // Notifications operations
  notifications: {
    getAll: () => getItem<Notification>(KEYS.NOTIFICATIONS),
    getByUserId: (userId: string) => 
      getItem<Notification>(KEYS.NOTIFICATIONS).filter(notification => notification.userId === userId),
    create: (notification: Omit<Notification, 'id'>) => {
      const notifications = getItem<Notification>(KEYS.NOTIFICATIONS);
      const newNotification = { ...notification, id: `notification_${Date.now()}` };
      setItem(KEYS.NOTIFICATIONS, [...notifications, newNotification]);
      return { data: newNotification, error: null };
    },
    markAsRead: (id: string) => {
      const notifications = getItem<Notification>(KEYS.NOTIFICATIONS);
      const index = notifications.findIndex(notification => notification.id === id);
      if (index === -1) return { error: 'Notification not found' };
      notifications[index] = { ...notifications[index], read: true };
      setItem(KEYS.NOTIFICATIONS, notifications);
      return { data: notifications[index], error: null };
    }
  }
}; 