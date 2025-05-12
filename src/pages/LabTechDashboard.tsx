import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskRound as Flask, User, LogOut, Check, X } from 'lucide-react';
import { getLabTests, getProfiles, getDoctors } from '../lib/localStorage';
import type { LabTest, Profile, Doctor } from '../types/database';

interface LabTestWithDetails extends LabTest {
  patient: Profile;
  doctor: Doctor;
}

export function LabTechDashboard() {
  const [labTechInfo, setLabTechInfo] = useState<{ name: string; staff_number: string } | null>(null);
  const [labTests, setLabTests] = useState<LabTestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [viewingTest, setViewingTest] = useState<LabTestWithDetails | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedInfo = localStorage.getItem('labTechInfo');
    if (!storedInfo) {
      navigate('/employee');
      return;
    }
    setLabTechInfo(JSON.parse(storedInfo));
  }, [navigate]);

  useEffect(() => {
    if (!labTechInfo) return;
    
    const interval = setInterval(loadLabTests, 5000); // Refresh every 5 seconds
    loadLabTests(); // Initial fetch
    
    return () => clearInterval(interval);
  }, [labTechInfo]);

  const loadLabTests = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const tests = getLabTests();
      const profiles = getProfiles();
      const doctors = getDoctors();

      // Combine lab tests with patient and doctor data
      const testsWithDetails = tests
        .map(test => ({
          ...test,
          patient: profiles.find(p => p.id === test.patient_id) || {
            id: '',
            first_name: 'Unknown',
            surname: 'Patient',
            age: 0,
            gender: '',
            created_at: '',
            updated_at: '',
            upcoming_appointments: 0
          },
          doctor: doctors.find(d => d.id === test.doctor_id) || {
            id: '',
            staff_number: '',
            first_name: 'Unknown',
            last_name: 'Doctor',
            email: '',
            phone: '',
            department: '',
            created_at: ''
          }
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLabTests(testsWithDetails);
    } catch (error) {
      console.error('Error loading lab tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (testId: string, newStatus: 'pending' | 'completed') => {
    try {
      const tests = getLabTests();
      const updatedTests = tests.map(test => 
        test.id === testId ? { ...test, status: newStatus } : test
      );
      localStorage.setItem('labTests', JSON.stringify(updatedTests));
      loadLabTests();
    } catch (error) {
      console.error('Error updating test status:', error);
    }
  };

  const filteredTests = labTests.filter(test =>
    test.test_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${test.patient.first_name} ${test.patient.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${test.doctor.first_name} ${test.doctor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = () => {
    localStorage.removeItem('labTechInfo');
    navigate('/employee');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      {/* Lab Tech Info Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {labTechInfo?.name}</h1>
            <p className="text-gray-600">Lab Technician</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-100 rounded-full" aria-hidden="true">
              <Flask className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tests</p>
              <p className="text-2xl font-semibold">{labTests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full" aria-hidden="true">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Tests</p>
              <p className="text-2xl font-semibold">
                {labTests.filter(test => test.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full" aria-hidden="true">
              <X className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Tests</p>
              <p className="text-2xl font-semibold">
                {labTests.filter(test => test.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Tests Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Lab Tests</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'pending'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
              {labTests.filter(test => test.status === 'pending').length > 0 && (
                <span className="ml-2 bg-white text-pink-600 px-2 py-0.5 rounded-full text-xs">
                  {labTests.filter(test => test.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'completed'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              aria-label="Search lab tests"
            />
            <Flask className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" aria-hidden="true" />
          </div>
          {filteredTests.map((test) => (
            <div key={test.id} className="border-l-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Flask className="w-4 h-4 text-pink-600" aria-hidden="true" />
                    {test.test_type}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient: {test.patient.first_name} {test.patient.surname}
                  </p>
                  <p className="text-sm text-gray-600">
                    Requested by Dr. {test.doctor.first_name} {test.doctor.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(test.created_at).toLocaleDateString()}
                  </p>
                  {test.status === 'completed' && (
                    <>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Description:</p>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Results:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{test.results}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    test.status === 'completed'
                      ? 'bg-green-50 text-green-600'
                      : test.status === 'pending'
                      ? 'bg-yellow-50 text-yellow-600'
                      : 'bg-gray-50 text-gray-600'
                  }`}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                  {test.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(test.id, 'completed')}
                      className="text-sm text-green-600 hover:text-green-700"
                      aria-label={`Mark ${test.test_type} as completed`}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredTests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No matching lab tests found' : 'No lab tests available'}
            </div>
          )}
        </div>
        
        {/* Results Modal */}
        {viewingTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Flask className="w-5 h-5 text-pink-600" />
                    {viewingTest.test_type}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Completed on {new Date(viewingTest.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setViewingTest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Patient Information</h4>
                  <p className="text-sm text-gray-600">
                    {viewingTest.patient.first_name} {viewingTest.patient.surname}
                  </p>
                  <p className="text-sm text-gray-600">
                    Age: {viewingTest.patient.age} | Gender: {viewingTest.patient.gender}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Requesting Doctor</h4>
                  <p className="text-sm text-gray-600">Dr. {viewingTest.doctor.first_name} {viewingTest.doctor.last_name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Test Description</h4>
                  <p className="text-sm text-gray-600">{viewingTest.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Test Results</h4>
                  <div className="bg-gray-50 p-4 rounded-lg mt-2">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewingTest.results}</p>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setViewingTest(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}