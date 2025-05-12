import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Calendar, 
  FileText, 
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Auth } from './pages/Auth';
import { StaffPortal } from './pages/StaffPortal';
import { Dashboard } from './pages/Dashboard';
import { MedicalRecords } from './pages/MedicalRecords';
import { Notifications } from './pages/Notifications';
import { Appointments } from './pages/Appointments';

// Add type for SidebarLink props
interface SidebarLinkProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active?: boolean;
}

function SidebarLink({ icon, text, to, active = false }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
        active ? 'bg-pink-50 text-pink-600' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const isDoctor = user?.role === 'doctor';
  const isLabTech = user?.role === 'lab_assistant';
  const isNurse = user?.role === 'nurse';
  const isPharmacist = user?.role === 'pharmacist';
  const isStaff = isDoctor || isLabTech || isNurse || isPharmacist;
  const isPatient = user?.role === 'patient';

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = isStaff ? '/staff' : '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? <Auth /> : <Navigate to={isStaff ? "/staff/dashboard" : "/dashboard"} replace />} />
          <Route path="/staff" element={!user ? <StaffPortal /> : <Navigate to="/staff/dashboard" replace />} />

          {/* Staff Routes */}
          <Route
            path="/staff/*"
            element={
              isStaff ? (
                <div className="min-h-screen bg-gray-100 flex">
                  {/* Staff Sidebar */}
                  <div className="w-64 bg-white shadow-lg">
                    <div className="p-4">
                      <Link to="/staff/dashboard" className="block">
                        <h2 className="text-xl font-bold mb-6 text-blue-600 hover:text-blue-700 transition-colors">NeemaMed Staff</h2>
                      </Link>
                      <nav>
                        <SidebarLink icon={<Bell size={20} />} text="Notifications" to="/staff/notifications" />
                        <SidebarLink icon={<Calendar size={20} />} text="Appointments" to="/staff/appointments" />
                        <SidebarLink icon={<FileText size={20} />} text="Medical Records" to="/staff/records" />
                        <div className="mt-12 border-t pt-4">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors text-gray-700 hover:bg-gray-50 w-full"
                          >
                            <LogOut size={20} />
                            <span>Log out</span>
                          </button>
                        </div>
                      </nav>
                    </div>
                  </div>

                  {/* Staff Main Content */}
                  <div className="flex-1">
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="records" element={<MedicalRecords />} />
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="appointments" element={<Appointments />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </div>
                </div>
              ) : (
                <Navigate to="/staff" replace />
              )
            }
          />

          {/* Patient Routes */}
          <Route
            path="/*"
            element={
              isPatient ? (
                <div className="min-h-screen bg-gray-100 flex">
                  {/* Patient Sidebar */}
                  <div className="w-64 bg-white shadow-lg">
                    <div className="p-4">
                      <Link to="/dashboard" className="block">
                        <h2 className="text-xl font-bold mb-6 text-pink-600 hover:text-pink-700 transition-colors">NeemaMed</h2>
                      </Link>
                      <nav>
                        <SidebarLink icon={<Bell size={20} />} text="Notifications" to="/notifications" />
                        <SidebarLink icon={<Calendar size={20} />} text="Appointments" to="/appointments" />
                        <SidebarLink icon={<FileText size={20} />} text="Medical Records" to="/records" />
                        <div className="mt-12 border-t pt-4">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors text-gray-700 hover:bg-gray-50 w-full"
                          >
                            <LogOut size={20} />
                            <span>Log out</span>
                          </button>
                        </div>
                      </nav>
                    </div>
                  </div>

                  {/* Patient Main Content */}
                  <div className="flex-1">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/records" element={<MedicalRecords />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;