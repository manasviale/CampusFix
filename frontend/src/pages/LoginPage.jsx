import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign in to your account</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center text-sm">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              required
              className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="you@bpitindia.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              required
              className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Demo Accounts Quick Login */}
      <div className="mt-6 pt-5 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center mb-3">Quick Demo Logins (Click to autofill)</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => { setEmail('student@bpitindia.edu.in'); setPassword('student123'); }}
            className="p-2 border border-gray-200 rounded-md bg-gray-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
          >
            <span className="font-semibold block text-gray-800">🎓 Student</span>
            <span className="text-gray-500 text-[10px]">View & Mark Affected</span>
          </button>
          <button
            type="button"
            onClick={() => { setEmail('volunteer@bpitindia.edu.in'); setPassword('volunteer123'); }}
            className="p-2 border border-gray-200 rounded-md bg-gray-50 hover:bg-green-50 hover:border-green-300 text-left transition-colors"
          >
            <span className="font-semibold block text-gray-800">🤝 Volunteer</span>
            <span className="text-gray-500 text-[10px]">Can Post Tickets</span>
          </button>
          <button
            type="button"
            onClick={() => { setEmail('faculty@bpitindia.edu.in'); setPassword('faculty123'); }}
            className="p-2 border border-gray-200 rounded-md bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-colors"
          >
            <span className="font-semibold block text-gray-800">🏛️ Faculty</span>
            <span className="text-gray-500 text-[10px]">Insights & Volunteers</span>
          </button>
          <button
            type="button"
            onClick={() => { setEmail('admin@bpitindia.edu.in'); setPassword('admin123'); }}
            className="p-2 border border-gray-200 rounded-md bg-gray-50 hover:bg-purple-50 hover:border-purple-300 text-left transition-colors"
          >
            <span className="font-semibold block text-gray-800">🛡️ Admin</span>
            <span className="text-gray-500 text-[10px]">Full Control & Status</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Don't have an account? </span>
        <Link to="/register" className="font-medium text-secondary hover:text-secondary-hover">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
