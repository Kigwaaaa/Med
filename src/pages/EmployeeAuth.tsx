import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

// Demo staff data
const DEMO_STAFF = [
  {
    email: 'doctor@example.com',
    password: 'demo123',
    role: 'doctor',
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    staff_number: 'DOC001',
    department: 'General Medicine'
  },
  {
    email: 'labtech@example.com',
    password: 'demo123',
    role: 'lab_tech',
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    staff_number: 'LAB001',
    department: 'Laboratory'
  }
];

export function EmployeeAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    setError('');

    if (!email) {
      setError('Email is required');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check against demo staff
      const staff = DEMO_STAFF.find(s => s.email === email && s.password === password);
      
      if (!staff) {
        throw new Error('Invalid email or password. Please try again.');
      }

      // Store user data in localStorage with explicit role
      const userData = {
        id: staff.id,
        email: staff.email,
        first_name: staff.first_name,
        last_name: staff.last_name,
        staff_number: staff.staff_number,
        department: staff.department,
        role: staff.role // Ensure role is explicitly set
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Use replace: true to prevent back navigation to login
      navigate('/dashboard', { replace: true });
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
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-white/50 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 flex flex-col items-center">
          <img
            src="https://cdn.jsdelivr.net/npm/@healthcare-illustrations/general/general-04.svg"
            alt="Medical Illustration"
            className="w-full max-w-md mb-8"
          />
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Staff Portal</h1>
            <p className="text-lg text-gray-600 max-w-md">
              Access the staff portal to manage patient records, appointments, and lab tests.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-pink-600">NeemaMed</h2>
            <h3 className="mt-6 text-2xl font-bold text-gray-900">Staff Login</h3>
            <p className="mt-2 text-gray-600">
              Sign in to access the staff portal
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Demo accounts:<br />
              Doctor: doctor@example.com / demo123<br />
              Lab Tech: labtech@example.com / demo123
            </p>
          </div>

          {error && (
            <div className="mt-4 border px-4 py-3 rounded-lg bg-red-50 border-red-200 text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="you@example.com"
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="••••••••"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/auth"
                className="text-sm text-pink-600 hover:text-pink-500"
              >
                Patient Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}