import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { db } from '../lib/localStorage';
import type { User as Doctor, Appointment } from '../lib/localStorage';

export function Appointments() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    function fetchData() {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setLoading(false);
        return;
      }

      const userData = JSON.parse(storedUser);

      // Fetch doctors
      const allDoctors = db.users.getAll().filter(user => user.role === 'doctor');
      setDoctors(allDoctors);

      // Fetch user's appointments
      const userAppointments = db.appointments.getByPatientId(userData.id);
      setAppointments(userAppointments);

      setLoading(false);
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) throw new Error('Not authenticated');

      const userData = JSON.parse(storedUser);

      const { data: newAppointment, error } = db.appointments.create({
        patientId: userData.id,
        doctorId: selectedDoctor,
        date,
        time,
        type: 'Consultation',
        notes: description,
        status: 'scheduled'
      });

      if (error) throw error;

      // Update local appointments list
      setAppointments([...appointments, newAppointment]);

      // Reset form
      setSelectedDoctor('');
      setDescription('');
      setDate('');
      setTime('');

    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Schedule an Appointment</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appointment Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">New Appointment</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="doctor-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor
                </label>
                <div className="relative">
                  <select
                    id="doctor-select"
                    className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    aria-label="Select a doctor"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.surname}
                      </option>
                    ))}
                  </select>
                  <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Brief Description of Problem
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 min-h-[100px]"
                    placeholder="Please describe your symptoms or reason for visit"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    aria-label="Description of your medical concern"
                  />
                  <FileText className="w-5 h-5 absolute left-3 top-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <div className="relative">
                  <input
                    id="appointment-date"
                    type="date"
                    className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    aria-label="Select appointment date"
                  />
                  <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <div className="relative">
                  <select 
                    id="appointment-time"
                    className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    aria-label="Select appointment time"
                  >
                    <option value="">Select a time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                  <Clock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors ${
                  submitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            </form>
          </div>
          
          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appointment) => {
                  const doctor = db.users.getById(appointment.doctorId);
                  return (
                    <div 
                      key={appointment.id} 
                      className={`border-l-4 ${
                        appointment.status === 'scheduled' 
                          ? 'border-yellow-400 bg-yellow-50' :
                        appointment.status === 'completed' 
                          ? 'border-green-500 bg-green-50' :
                        appointment.status === 'cancelled' 
                          ? 'border-red-500 bg-red-50' :
                          'border-gray-300'
                      } pl-4 py-2`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            {appointment.type}
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                              appointment.status === 'scheduled' 
                                ? 'bg-yellow-100 text-yellow-700' :
                              appointment.status === 'completed' 
                                ? 'bg-green-100 text-green-700' :
                              appointment.status === 'cancelled' 
                                ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </p>
                          {doctor && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-900">
                                Dr. {doctor.firstName} {doctor.surname}
                              </p>
                              <p className="text-xs text-gray-600">
                                Staff Number: {doctor.staff_number}
                              </p>
                            </div>
                          )}
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              {appointment.notes}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-2">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No appointments scheduled</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}