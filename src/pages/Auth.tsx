import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Users, Eye, EyeOff } from 'lucide-react';
import { db } from '../lib/localStorage';
import { useAuth } from '../contexts/AuthContext';

export function Auth() {
  const { setUser } = useAuth();
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

  // Demo user data
  const demoUsers = [
    {
      id: 'pat1',
      email: 'demo@example.com',
      password: 'demo123',
      firstName: 'Demo',
      surname: 'User',
      age: 30,
      gender: 'male',
      role: 'patient'
    },
    {
      id: 'doc1',
      email: 'doctor@example.com',
      password: 'doctor123',
      firstName: 'Sarah',
      surname: 'Johnson',
      age: 35,
      gender: 'female',
      role: 'doctor',
      staff_number: 'DOC123',
      department: 'General Practice'
    },
    {
      id: 'lab1',
      email: 'lab@example.com',
      password: 'lab123',
      firstName: 'Michael',
      surname: 'Chen',
      age: 40,
      gender: 'male',
      role: 'lab_assistant',
      staff_number: 'LAB456',
      department: 'Laboratory'
    },
    {
      id: 'nur1',
      email: 'nurse@example.com',
      password: 'nurse123',
      firstName: 'Emily',
      surname: 'Williams',
      age: 32,
      gender: 'female',
      role: 'nurse',
      staff_number: 'NUR789',
      department: 'Nursing'
    },
    {
      id: 'phr1',
      email: 'pharm@example.com',
      password: 'pharm123',
      firstName: 'David',
      surname: 'Brown',
      age: 38,
      gender: 'male',
      role: 'pharmacist',
      staff_number: 'PHR012',
      department: 'Pharmacy'
    }
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    // Validate password length
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Check against demo users first
        const demoUser = demoUsers.find(u => u.email === email && u.password === password);
        
        if (demoUser) {
          // Store user data in localStorage and update auth state
          setUser(demoUser);
          localStorage.setItem('user', JSON.stringify(demoUser));
          
          // Redirect based on user role
          const redirectPath = demoUser.role === 'doctor' || demoUser.role === 'lab_assistant' || 
                             demoUser.role === 'nurse' || demoUser.role === 'pharmacist'
            ? '/staff/dashboard'
            : '/dashboard';
          
          navigate(redirectPath, { replace: true });
          return;
        }

        // If not a demo user, check against users in local storage
        const user = db.users.getByEmail(email);
        
        if (!user || user.password !== password) {
          throw new Error('Invalid email or password. Please try again.');
        }

        // Store user data in localStorage and update auth state
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect based on user role
        const role = user.role || 'patient';
        const redirectPath = role === 'doctor' || role === 'lab_assistant' || 
                           role === 'nurse' || role === 'pharmacist'
          ? '/staff/dashboard'
          : '/dashboard';
        
        navigate(redirectPath, { replace: true });
      } else {
        // Check if user already exists
        const existingUser = db.users.getByEmail(email);
        if (existingUser) {
          throw new Error('An account with this email already exists.');
        }

        // Create new user
        const { data: newUser, error: signUpError } = db.users.create({
          email,
          password,
          firstName,
          surname,
          age: parseInt(age),
          gender,
          role: 'patient'
        });

        if (signUpError) {
          throw new Error('Failed to create account. Please try again.');
        }

        if (newUser) {
          setError('Account created successfully! Please log in.');
          setEmail('');
          setPassword('');
          setFirstName('');
          setSurname('');
          setAge('');
          setGender('');
          setIsLogin(true);
        } else {
          throw new Error('Failed to create account. Please try again.');
        }
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
              {isLogin ? 'Welcome Back!' : 'Join Our Healthcare Family'}
            </h3>
            <p className="mt-2 text-gray-600">
              {isLogin
                ? 'Sign in to access your medical records and appointments'
                : 'Create an account to start your healthcare journey with us'}
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="mt-8 space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                      Surname
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="surname"
                        type="text"
                        required
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="age"
                        type="number"
                        required
                        min="0"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <div className="mt-1 relative">
                      <select
                        id="gender"
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setPasswordError('');
                }}
                className="font-medium text-pink-600 hover:text-pink-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {demoUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setEmail(user.email);
                    setPassword(user.password);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <User className="h-5 w-5 mr-2 text-gray-400" />
                  {user.role === 'patient' ? 'Demo Patient' : `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}