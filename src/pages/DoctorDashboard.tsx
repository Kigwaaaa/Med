import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, User, Clock, Check, X, Eye, Filter, FlaskRound as Flask, Bell, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { supabase } from '../supabase';
import type { Doctor, Appointment, Profile, LabTest } from '../types/database';

interface LabTestWithDetails extends LabTest {
  patient: Profile;
  results?: string;
  status: 'pending' | 'completed' | 'rejected';
}

export function DoctorDashboard() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<(Appointment & { patient: Profile })[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [labTests, setLabTests] = useState<Record<string, LabTestWithDetails[]>>({});
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState<'all' | 'today' | 'week'>('all');
  const [debouncedFilter] = useDebounce(filterValue, 300);
  const [showLabTestForm, setShowLabTestForm] = useState(false);
  const [labTestType, setLabTestType] = useState('');
  const [labTestDescription, setLabTestDescription] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadLabResults, setUnreadLabResults] = useState<LabTestWithDetails[]>([]);
  const [isUpdatingAppointment, setIsUpdatingAppointment] = useState(false);
  const [isRequestingLabTest, setIsRequestingLabTest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedDoctorInfo = localStorage.getItem('doctorInfo');
      if (!storedDoctorInfo) {
        navigate('/employee');
        return;
      }
      const doctorData = JSON.parse(storedDoctorInfo);
      setDoctorInfo(doctorData);
    } catch (error) {
      console.error('Error parsing doctor info:', error);
      navigate('/employee');
    }
  }, [navigate]);

  const fetchLabTests = async () => {
    try {
      if (!doctorInfo) return;

      const { data, error } = await supabase
        .from('lab_tests')
        .select(`
          *,
          patient:profiles(*)
        `)
        .eq('doctor_id', doctorInfo.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validTests = (data || []).filter(test => test.patient !== null);
      setUnreadLabResults(validTests.filter(test => test.status === 'completed'));
      
      const groupedTests = validTests.reduce((acc, test) => {
        if (!acc[test.patient_id]) {
          acc[test.patient_id] = [];
        }
        acc[test.patient_id].push(test);
        return acc;
      }, {} as Record<string, LabTestWithDetails[]>);

      setLabTests(groupedTests);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      if (!doctorInfo) return;

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles(*)
        `)
        .eq('doctor_id', doctorInfo.id)
        .order('appointment_date', { ascending: true });

      if (debouncedFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        query = query
          .gte('appointment_date', today.toISOString())
          .lt('appointment_date', tomorrow.toISOString());
      } else if (debouncedFilter === 'week') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        query = query
          .gte('appointment_date', today.toISOString())
          .lt('appointment_date', nextWeek.toISOString());
      }

      const { data: appointments, error } = await query;
      
      if (error) throw error;

      const validAppointments = (appointments || []).filter(
        appointment => appointment.patient !== null
      );
      
      setAppointments(validAppointments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorInfo) {
      fetchAppointments();
      fetchLabTests();
    }
  }, [doctorInfo, debouncedFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-600';
      case 'accepted': return 'bg-green-50 text-green-600';
      case 'rejected': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const handleAppointmentAction = async (appointmentId: string, status: 'accepted' | 'rejected') => {
    setIsUpdatingAppointment(true);
    try {
      // Optimistic update
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? { ...app, status } : app
      ));

      const appointment = appointments.find(a => a.id === appointmentId)!;
      const { error } = await supabase.rpc('update_appointment_status', {
        p_appointment_id: appointmentId,
        p_status: status,
        p_patient_id: appointment.patient_id,
        p_current_appointments: appointment.patient.upcoming_appointments
      });

      if (error) {
        await fetchAppointments(); // Rollback on error
        throw error;
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment. Please try again.');
    } finally {
      setIsUpdatingAppointment(false);
    }
  };

  const handleLabTestRequest = async (appointment: Appointment & { patient: Profile }) => {
    setIsRequestingLabTest(true);
    try {
      const { data: existingTest, error: checkError } = await supabase
        .from('lab_tests')
        .select('*')
        .eq('appointment_id', appointment.id)
        .eq('status', 'completed')
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingTest) {
        alert('A completed lab test already exists for this appointment');
        return;
      }

      if (!labTestType || !labTestDescription || !doctorInfo) {
        alert('Please fill in all fields');
        return;
      }

      const { error } = await supabase
        .from('lab_tests')
        .insert({
          appointment_id: appointment.id,
          doctor_id: doctorInfo.id,
          patient_id: appointment.patient_id,
          test_type: labTestType,
          description: labTestDescription,
          status: 'pending'
        });

      if (error) throw error;

      alert('Lab test requested successfully');
      await fetchLabTests();
      setShowLabTestForm(false);
      setLabTestType('');
      setLabTestDescription('');
    } catch (error) {
      console.error('Error requesting lab test:', error);
      alert('Failed to request lab test. Please try again.');
    } finally {
      setIsRequestingLabTest(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('doctorInfo');
    navigate('/employee');
  };

  // Memoize filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => 
      selectedTab === 'pending' 
        ? appointment.status === 'pending'
        : appointment.status === 'accepted'
    );
  }, [appointments, selectedTab]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6 text-pink-600">NeemaMed</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setShowNotifications(false)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                !showNotifications ? 'bg-pink-50 text-pink-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                showNotifications ? 'bg-pink-50 text-pink-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell size={20} />
              <span>Notifications</span>
              {unreadLabResults.length > 0 && (
                <span className="ml-auto bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                  {unreadLabResults.length}
                </span>
              )}
            </button>
          </nav>
          <div className="mt-12 border-t pt-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {doctorInfo?.name}</h1>
              <p className="text-gray-600">Staff Number: {doctorInfo?.staff_number}</p>
            </div>
          </div>
        </div>

        {showNotifications ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">New Lab Results</h2>
            <div className="space-y-4">
              {unreadLabResults.map((test) => (
                <div key={test.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <Flask className="w-4 h-4 text-pink-600" />
                        {test.test_type}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Patient: {test.patient.first_name} {test.patient.surname}
                      </p>
                      <p className="text-sm text-gray-600">
                        Completed on: {new Date(test.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Description:</p>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Results:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{test.results}</p>
                      </div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs bg-green-50 text-green-600 rounded-full">
                      New Result
                    </span>
                  </div>
                </div>
              ))}
              {unreadLabResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No new lab results
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Appointment Requests</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    className="border rounded-lg px-3 py-1 text-sm"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value as 'all' | 'today' | 'week')}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
                <button
                  onClick={() => setSelectedTab('pending')}
                  className={`px-4 py-2 rounded-lg ${
                    selectedTab === 'pending' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setSelectedTab('accepted')}
                  className={`px-4 py-2 rounded-lg ${
                    selectedTab === 'accepted'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Accepted
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = new Date(appointment.appointment_date);
                return (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="bg-pink-50 p-2 rounded-full">
                          <User className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {appointment.patient.first_name} {appointment.patient.surname}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Age: {appointment.patient.age} | Gender: {appointment.patient.gender}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString([], { 
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Type: {appointment.type}
                          </p>
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {appointment.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleAppointmentAction(appointment.id, 'accepted')}
                              disabled={isUpdatingAppointment}
                              className={`p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 ${
                                isUpdatingAppointment ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Accept"
                            >
                              {isUpdatingAppointment ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                              ) : (
                                <Check className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
                              disabled={isUpdatingAppointment}
                              className={`p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 ${
                                isUpdatingAppointment ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Reject"
                            >
                              {isUpdatingAppointment ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                              ) : (
                                <X className="w-5 h-5" />
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setSelectedAppointment(
                              selectedAppointment === appointment.id ? null : appointment.id
                            )}
                            className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {selectedAppointment === appointment.id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Patient Details</h4>
                          <button
                            onClick={() => alert('Medical Records feature coming soon!')}
                            className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200"
                          >
                            View Medical Records
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-600">Full Name</p>
                              <p className="font-medium">
                                {appointment.patient.first_name} {appointment.patient.surname}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Age</p>
                              <p className="font-medium">{appointment.patient.age}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Gender</p>
                              <p className="font-medium">{appointment.patient.gender}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Upcoming Appointments</p>
                              <p className="font-medium">{appointment.patient.upcoming_appointments}</p>
                            </div>
                          </div>
                          
                          <div className="col-span-2 mt-4">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-medium">Lab Tests</h5>
                              <button
                                onClick={() => setShowLabTestForm(!showLabTestForm)}
                                className="flex items-center gap-2 text-sm bg-pink-600 text-white px-3 py-1.5 rounded-lg hover:bg-pink-700"
                              >
                                <Flask className="w-4 h-4" />
                                Request Lab Test
                              </button>
                            </div>

                            {showLabTestForm && (
                              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Test Type
                                  </label>
                                  <select
                                    value={labTestType}
                                    onChange={(e) => setLabTestType(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    required
                                  >
                                    <option value="">Select test type</option>
                                    <option value="Blood Test">Blood Test</option>
                                    <option value="Urinalysis">Urinalysis</option>
                                    <option value="X-Ray">X-Ray</option>
                                    <option value="MRI">MRI</option>
                                    <option value="CT Scan">CT Scan</option>
                                    <option value="Ultrasound">Ultrasound</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={labTestDescription}
                                    onChange={(e) => setLabTestDescription(e.target.value)}
                                    className="w-full p-2 border rounded-lg h-24"
                                    placeholder="Enter test details and instructions"
                                    required
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setShowLabTestForm(false);
                                      setLabTestType('');
                                      setLabTestDescription('');
                                    }}
                                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleLabTestRequest(appointment)}
                                    disabled={isRequestingLabTest}
                                    className={`px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 ${
                                      isRequestingLabTest ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    {isRequestingLabTest ? (
                                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                                    ) : (
                                      'Submit Request'
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {labTests[appointment.patient_id]?.length > 0 && (
                            <div className="col-span-2 mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">Lab Test Results</h5>
                                <span className="text-sm text-gray-500">
                                  {labTests[appointment.patient_id].length} result{labTests[appointment.patient_id].length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="space-y-3">
                                {labTests[appointment.patient_id].map((test) => (
                                  <div key={test.id} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h6 className="font-medium flex items-center gap-2">
                                          <Flask className="w-4 h-4 text-pink-600" />
                                          {test.test_type}
                                        </h6>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {new Date(test.created_at).toLocaleDateString()}
                                        </p>
                                        <div className="mt-2">
                                          <p className="text-sm font-medium">Description:</p>
                                          <p className="text-sm text-gray-600">{test.description}</p>
                                        </div>
                                        <div className="mt-2">
                                          <p className="text-sm font-medium">Results:</p>
                                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{test.results}</p>
                                        </div>
                                      </div>
                                      <span className="inline-block px-2 py-1 text-xs bg-green-50 text-green-600 rounded-full">
                                        Completed
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No {selectedTab} appointments found
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}