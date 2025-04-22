import React, { useEffect, useState } from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Profile, Appointment, Doctor } from '../types/database';

export function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<(Appointment & { doctor: Doctor })[]>([]);
  const [allAppointments, setAllAppointments] = useState<(Appointment & { doctor: Doctor })[]>([]);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get profile data
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(data);
        
        // Get last login time from user metadata
        const lastLoginTime = user.last_sign_in_at;
        if (lastLoginTime) {
          const date = new Date(lastLoginTime);
          setLastLogin(date.toLocaleString());
          
          // Fetch all appointments
          const { data: allAppointmentsData } = await supabase
            .from('appointments')
            .select(`
              *,
              doctor:doctors(*)
            `)
            .eq('patient_id', user.id)
            .in('status', ['pending', 'accepted']);
          
          // Sort appointments: pending first, then by date
          const sortedAppointments = (allAppointmentsData || []).sort((a, b) => {
            // First sort by status (pending comes before accepted)
            if (a.status !== b.status) {
              return a.status === 'pending' ? -1 : 1;
            }
            // Then sort by date
            return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
          });
          
          setAllAppointments(sortedAppointments);
          
          // Filter accepted appointments for the upcoming section
          const upcoming = sortedAppointments.filter(
            app => app.status === 'accepted' && new Date(app.appointment_date) >= new Date()
          );
          setUpcomingAppointments(upcoming);
        }
      }
    }

    getProfile();
  }, []);

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Welcome Message */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Welcome back, {profile ? `${profile.first_name} ${profile.surname}` : 'Patient'}
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
        {allAppointments.map((appointment) => (
          <div 
            key={appointment.id} 
            className={`border-l-4 bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow ${
              appointment.status === 'pending' 
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
                  With Dr. {appointment.doctor.name}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
                    {new Date(appointment.appointment_date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {appointment.notes && (
                  <p className="text-sm text-gray-600 italic">
                    {appointment.notes}
                  </p>
                )}
              </div>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                appointment.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
        {allAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No appointments found
          </div>
        )}
      </section>
    </main>
  );
}