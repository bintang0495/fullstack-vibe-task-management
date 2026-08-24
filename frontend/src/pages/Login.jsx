import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, CheckSquare } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Brand Header */}
        <div className="text-center">
          <div 
            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-200"
            style={{ backgroundColor: '#2563eb' }}
          >
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Weekly Task Scheduler
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Kelola jadwal rutin dan custom task mingguan Anda
          </p>
        </div>

        {/* Tab Toggle Switcher */}
        <div className="flex rounded-xl bg-gray-100 p-1.5 border border-gray-200">
          <button
            type="button"
            className="flex-1 py-2 text-sm font-semibold rounded-lg bg-white text-blue-600 shadow-sm transition"
          >
            Log In
          </button>
          <Link
            to="/register"
            className="flex-1 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 text-center transition"
          >
            Sign Up (Daftar)
          </Link>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-sm font-bold shadow-md shadow-blue-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <LogIn className="w-4 h-4 mr-2 text-white" />
              {isLoading ? 'Sedang Masuk...' : 'Log In (Masuk)'}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-xs text-gray-400">atau</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <Link
              to="/register"
              className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Belum punya akun? Buat Akun (Sign Up)
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
