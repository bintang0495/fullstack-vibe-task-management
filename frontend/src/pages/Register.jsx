import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, CheckSquare } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      return setError('Password harus minimal 8 karakter');
    }

    setIsLoading(true);
    try {
      await register(email, password);
      // Redirect to login page on success
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-200">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Buat Akun Baru
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Daftar untuk mulai mengelola jadwal rutin Anda
          </p>
        </div>

        {/* Tab Toggle Switcher */}
        <div className="flex rounded-xl bg-gray-100 p-1.5 border border-gray-200">
          <Link
            to="/login"
            className="flex-1 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 text-center transition"
          >
            Log In (Masuk)
          </Link>
          <button
            type="button"
            className="flex-1 py-2 text-sm font-semibold rounded-lg bg-white text-blue-600 shadow-sm transition"
          >
            Sign Up
          </button>
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
              Password (Minimal 8 karakter)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md shadow-blue-100 transition-all ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isLoading ? 'Sedang Mendaftar...' : 'Sign Up (Daftar Sekarang)'}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-xs text-gray-400">atau</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <Link
              to="/login"
              className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Sudah punya akun? Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
