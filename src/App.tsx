import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Users, 
  Calendar, 
  FileText, 
  RefreshCw, 
  LogOut,
} from 'lucide-react';

import { Dashboard } from './pages/Dashboard';
import { MedicalRecords } from './pages/MedicalRecords';
import { Appointments } from './pages/Appointments';
import { Notifications } from './pages/Notifications';
import { AboutUs } from './pages/AboutUs';
import { Auth } from './pages/Auth';

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={
          user ? <Navigate to="/dashboard" replace /> : <Auth />
        } />
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> :
          <Navigate to="/auth" replace />
        } />
        
        {/* Patient Routes */}
        <Route
          path="/*"
          element={
            user ? (
              <div className="min-h-screen bg-gray-100 flex">
                {/* Sidebar */}
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

                {/* Main Content */}
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/records" element={<MedicalRecords />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/about" element={<AboutUs />} />
                </Routes>
              </div>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;