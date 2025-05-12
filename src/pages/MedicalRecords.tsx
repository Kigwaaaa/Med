import React, { useState, useEffect } from 'react';
import { Search, Check, FlaskRound as Flask } from 'lucide-react';
import type { LabTest, Doctor } from '../types/database';
import { getLabTests, getDoctors } from '../lib/localStorage';

interface LabTestWithDoctor extends LabTest {
  doctor: Doctor;
}

export function MedicalRecords() {
  const [labTests, setLabTests] = useState<LabTestWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLabTests();
  }, []);

  const loadLabTests = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const tests = getLabTests();
      const doctors = getDoctors();

      // Combine lab tests with doctor data
      const testsWithDoctors = tests
        .filter(test => test.patient_id === user.id)
        .map(test => ({
          ...test,
          doctor: doctors.find(doc => doc.id === test.doctor_id) || {
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

      setLabTests(testsWithDoctors);
    } catch (error) {
      console.error('Error loading lab tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = labTests.filter(test => 
    test.test_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.results && test.results.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search for medical records"
              className="w-full p-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search medical records"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button 
            className="bg-pink-600 text-white px-4 py-2 rounded-lg"
            onClick={() => setSearchQuery('')}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Lab Tests Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-6">Lab Tests</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <div key={test.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <Flask className="w-4 h-4 text-pink-600" />
                        {test.test_type}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Dr. {test.doctor.first_name} {test.doctor.last_name}
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
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      test.status === 'completed'
                        ? 'bg-green-50 text-green-600'
                        : test.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}

              {filteredTests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No matching lab tests found' : 'No lab tests available'}
                </div>
              )}
            </div>
         </div>
      </div>
    </div>
  );
}