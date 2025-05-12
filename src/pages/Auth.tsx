import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Users, Eye, EyeOff } from 'lucide-react';
import { getProfiles, saveProfile } from '../lib/localStorage';
import type { Profile } from '../types/database';

// Demo user data
const DEMO_USERS = [
  {
    email: 'patient@example.com',
    password: 'demo123',
    first_name: 'Demo',
    surname: 'User',
    age: 30,
    gender: 'male',
    role: 'patient',
    id: '1'
  }
];

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    setPasswordError('');
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
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin) {
      if (!firstName || !surname) {
        setError('First name and surname are required');
        return false;
      }

      if (!age || parseInt(age) <= 0 || parseInt(age) > 150) {
        setError('Please enter a valid age between 1 and 150');
        return false;
      }

      if (!gender) {
        setError('Please select a gender');
        return false;
      }
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
      if (isLogin) {
        // Check against demo users
        const user = DEMO_USERS.find(u => u.email === email && u.password === password);
        
        if (!user) {
          throw new Error('Invalid email or password. Please try again.');
        }

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        // Use replace: true to prevent back navigation to login
        navigate('/dashboard', { replace: true });
      } else {
        // Check if email already exists
        const existingUser = DEMO_USERS.find(u => u.email === email);
        if (existingUser) {
          throw new Error('An account with this email already exists.');
        }

        // Create new profile using local storage
        const newProfile: Omit<Profile, 'id' | 'created_at' | 'updated_at'> = {
          first_name: firstName,
          surname,
          age: parseInt(age),
          gender,
          upcoming_appointments: 0
        };

        // Save profile to local storage
        const savedProfile = saveProfile(newProfile);

        // Create user object with auth data
        const newUser = {
          ...savedProfile,
          email,
          password, // Note: In a real app, this should be hashed
          role: 'patient'
        };

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Show success message and redirect
        setError('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      }
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to NeemaMed</h1>
            <p className="text-lg text-gray-600 max-w-md">
              Your trusted partner in healthcare. Experience personalized medical care with our state-of-the-art facilities.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-pink-600">NeemaMed</h2>
            <h3 className="mt-6 text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="mt-2 text-gray-600">
              {isLogin ? 'Sign in to access your account' : 'Sign up to get started'}
            </p>
          </div>

          {error && (
            <div className="mt-4 border px-4 py-3 rounded-lg bg-red-50 border-red-200 text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="mt-8 space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        placeholder="John"
                      />
                      <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                      Surname
                    </label>
                    <div className="relative">
                      <input
                        id="surname"
                        name="surname"
                        type="text"
                        required
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Doe"
                      />
                      <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <div className="relative">
                      <input
                        id="age"
                        name="age"
                        type="number"
                        required
                        min="0"
                        max="150"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        placeholder="25"
                      />
                      <Users className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        id="gender"
                        name="gender"
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <Users className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </>
            )}

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
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-pink-600 hover:text-pink-500"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
              
              <Link
                to="/employee-auth"
                className="text-sm text-gray-600 hover:text-gray-500 flex items-center gap-2"
              >
                <User size={16} />
                Staff Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}