import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { setAuth } from '../../utils/auth';
import PixelButton from '../shared/PixelButton';
import { User, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      const { token, student } = response.data.data;
      
      // Store token and user data
      setAuth(token, student);
      
    // Route based on role
    if (student.role === 'parent') {
      navigate('/parent/dashboard');
    } else {
      navigate('/dashboard');
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="min-h-screen bg-pixel-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-block bg-pixel-gold border-4 border-white shadow-pixel p-4 mb-4">
            <h1 className="text-4xl font-pixel text-white">📚</h1>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">StudyQuest</h1>
          <p className="text-sm font-pixel text-gray-400">Begin Your Learning Adventure</p>
        </div>

        {/* Login Form */}
        <div className="bg-pixel-primary border-4 border-pixel-accent shadow-pixel p-8">
          <h2 className="text-xl font-pixel text-white mb-6 text-center">Player Login</h2>
          
          {error && (
            <div className="bg-red-900 border-4 border-red-600 text-white text-xs font-pixel p-4 mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-pixel text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-pixel-dark border-4 border-pixel-accent text-white font-mono text-sm px-10 py-3 focus:outline-none focus:border-pixel-gold"
                  placeholder="hero@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-pixel text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-pixel-dark border-4 border-pixel-accent text-white font-mono text-sm px-10 py-3 focus:outline-none focus:border-pixel-gold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <PixelButton
              type="submit"
              disabled={loading}
              variant="gold"
              className="w-full"
            >
              {loading ? 'Logging in...' : 'Enter Quest'}
            </PixelButton>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-xs font-pixel text-gray-400">
              New adventurer?{' '}
              <Link to="/register" className="text-pixel-gold hover:text-yellow-400">
                Create Account
              </Link>
            </p>
          </div>

          {/* Test Credentials */}
          <div className="mt-6 pt-6 border-t-4 border-pixel-accent">
            <p className="text-xs font-pixel text-gray-500 mb-2">Test Credentials:</p>
            <div className="bg-pixel-dark border-2 border-pixel-accent p-3">
              <p className="text-xs font-mono text-gray-400">Email: alice@example.com</p>
              <p className="text-xs font-mono text-gray-400">Password: Alice123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}