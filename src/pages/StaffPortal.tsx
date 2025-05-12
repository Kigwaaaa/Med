import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { db } from '../lib/localStorage';
import { useAuth } from '../contexts/AuthContext';

export function StaffPortal() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check against users in local storage
      const user = db.users.getByEmail(email);
      
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password. Please try again.');
      }

      // Check if user is staff
      const isStaff = ['doctor', 'lab_assistant', 'nurse', 'pharmacist'].includes(user.role);
      if (!isStaff) {
        throw new Error('Access denied. This portal is for staff members only.');
      }

      // Store user data in localStorage and update auth state
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on staff role
      const redirectPath = user.role === 'doctor' 
        ? '/doctor/dashboard'
        : user.role === 'lab_assistant'
        ? '/lab/dashboard'
        : user.role === 'nurse'
        ? '/nurse/dashboard'
        : '/pharmacy/dashboard';
      
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/medical-cubes-pattern.png"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      {/* Left side - Illustration and Welcome Message */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white/50 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 flex flex-col items-center">
          <img
            src="https://cdn.jsdelivr.net/npm/@healthcare-illustrations/general/general-05.svg"
            alt="Medical Staff Illustration"
            className="w-full max-w-md mb-8"
          />
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Staff Portal</h1>
            <p className="text-lg text-gray-600 max-w-md">
              Secure access for medical staff. Manage patient records, appointments, and medical services.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-600">NeemaMed</h2>
            <h3 className="mt-6 text-2xl font-bold text-gray-900">Staff Login</h3>
            <p className="mt-2 text-gray-600">
              Sign in to access the staff portal
            </p>
          </div>

          {error && (
            <div className="mt-4 border px-4 py-3 rounded-lg bg-red-50 border-red-200 text-red-600">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Staff Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="staff@neemamed.com"
                />
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="text-center">
              <a
                href="/"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to Patient Portal
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 