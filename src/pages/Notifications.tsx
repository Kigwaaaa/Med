import React, { useState, useEffect } from 'react';
import { FlaskRound as Flask } from 'lucide-react';
import type { LabTest, Doctor } from '../types/database';
import { getLabTests, getDoctors } from '../lib/localStorage';

interface LabTestWithDoctor extends LabTest {
  doctor: Doctor;
}

export function Notifications() {
  const [labTests, setLabTests] = useState<LabTestWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);

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
        .filter(test => test.patient_id === user.id && test.status === 'completed')
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Lab Test Results</h2>
          
          <div className="space-y-4">
            {labTests.map((test) => (
              <div key={test.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Flask className="w-5 h-5 text-pink-600" />
                      {test.test_type}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested by Dr. {test.doctor.first_name} {test.doctor.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(test.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-3">
                      <p className="text-sm font-medium">Description:</p>
                      <p className="text-sm text-gray-600">{test.description}</p>
                    </div>
                    <div className="mt-3">
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

            {labTests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No lab test results available
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}