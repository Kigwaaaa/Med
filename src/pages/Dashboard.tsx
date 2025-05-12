import React, { useEffect, useState } from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/localStorage';
import type { User, Appointment } from '../lib/localStorage';

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    function getProfile() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Get last login time
        const lastLoginTime = localStorage.getItem('lastLogin');
        if (lastLoginTime) {
          const date = new Date(lastLoginTime);
          setLastLogin(date.toLocaleString());
        }
        
        // Fetch all appointments
        const appointments = db.appointments.getByPatientId(userData.id);
        
        // Sort appointments: scheduled first, then by date
        const sortedAppointments = appointments.sort((a, b) => {
          // First sort by status (scheduled comes before completed)
          if (a.status !== b.status) {
            return a.status === 'scheduled' ? -1 : 1;
          }
          // Then sort by date
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        setAllAppointments(sortedAppointments);
        
        // Filter scheduled appointments for the upcoming section
        const upcoming = sortedAppointments.filter(
          app => app.status === 'scheduled' && new Date(app.date) >= new Date()
        );
        setUpcomingAppointments(upcoming);
      }
    }

    getProfile();
  }, []);

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Welcome Message */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Welcome back, {user ? `${user.firstName} ${user.surname}` : 'Patient'}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{allAppointments.length}</span>
            </div>
            <p className="text-sm text-gray-600">Appointments</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">{lastLogin ? 'Active' : 'First Login'}</span>
            </div>
            <p className="text-sm text-gray-600">Last Login</p>
            {lastLogin && (
              <p className="text-xs text-gray-500 mt-1">{lastLogin}</p>
            )}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">{upcomingAppointments.length}</span>
            </div>
            <p className="text-sm text-gray-600">Upcoming Appointments</p>
          </div>
        </div>
      </section>

      {/* Upcoming Appointments */}
      <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          <Link 
            to="/appointments"
            className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
          >
            New Appointment
          </Link>
        </div>
        {allAppointments.map((appointment) => {
          const doctor = db.users.getById(appointment.doctorId);
          return (
            <div 
              key={appointment.id} 
              className={`border-l-4 bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow ${
                appointment.status === 'scheduled' 
                  ? 'border-yellow-400' 
                  : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-pink-600" />
                    <h3 className="font-semibold">{appointment.type}</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    With Dr. {doctor ? `${doctor.firstName} ${doctor.surname}` : 'Unknown'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(appointment.date).toLocaleDateString()} at{' '}
                      {appointment.time}
                    </span>
                  </div>
                  {appointment.notes && (
                    <p className="text-sm text-gray-600 italic">
                      {appointment.notes}
                    </p>
                  )}
                </div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  appointment.status === 'scheduled'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
        {allAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No appointments found
          </div>
        )}
      </section>
    </main>
  );
}