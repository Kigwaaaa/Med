import React, { useState, useEffect } from 'react';
import { Search, Check, FlaskRound as Flask } from 'lucide-react';
import { db } from '../lib/localStorage';
import type { User, MedicalRecord } from '../lib/localStorage';

interface MedicalRecordWithDoctor extends MedicalRecord {
  doctor: User;
}

export function MedicalRecords() {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      const userData = JSON.parse(storedUser);
      const records = db.medicalRecords.getByPatientId(userData.id);
      
      // Get doctor information for each record
      const recordsWithDoctors = records.map(record => ({
        ...record,
        doctor: db.users.getById(record.doctorId) || {
          id: 'unknown',
          firstName: 'Unknown',
          surname: 'Doctor',
          email: '',
          password: '',
          age: 0,
          gender: '',
          role: 'doctor'
        }
      }));

      setMedicalRecords(recordsWithDoctors);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = medicalRecords.filter(record => 
    record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.prescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.notes.toLowerCase().includes(searchQuery.toLowerCase())
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
        </div>
      </div>

      {/* Medical Records Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-6">Medical Records</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Flask className="w-4 h-4 text-pink-600" />
                      {record.diagnosis}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Dr. {record.doctor.firstName} {record.doctor.surname}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Prescription:</p>
                      <p className="text-sm text-gray-600">{record.prescription}</p>
                    </div>
                    {record.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Notes:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No matching records found' : 'No medical records available'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}