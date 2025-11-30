import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { setAuth } from '../../utils/auth';
import PixelButton from '../shared/PixelButton';
import { BookOpen, Mail, Lock, LogIn } from 'lucide-react';

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
      setAuth(token, student);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-20 h-20 bg-pixel-gold border-4 border-white shadow-pixel mb-4">
            <BookOpen className="w-12 h-12 text-white m-auto mt-2" />
          </div>
          <h1 className="text-2xl font-pixel text-white mb-2">StudyQuest</h1>
          <p className="text-xs font-pixel text-gray-400">Level Up Your Learning</p>
        </div>

        {/* Login Form */}
        <div className="pixel-card">
          <h2 className="text-lg font-pixel text-pixel-gold mb-6 text-center">
            Login
          </h2>

          {error && (
            <div className="bg-red-900 border-4 border-red-500 p-4 mb-6">
              <p className="text-xs font-pixel text-white text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs font-pixel text-white mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-pixel-primary border-4 border-pixel-accent text-white font-mono focus:border-pixel-gold focus:outline-none"
                placeholder="player@studyquest.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-pixel text-white mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-pixel-primary border-4 border-pixel-accent text-white font-mono focus:border-pixel-gold focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <PixelButton
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Loading...' : 'Start Quest'}
            </PixelButton>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-xs font-pixel text-gray-400">
              New Player?{' '}
              <Link to="/register" className="text-pixel-gold hover:text-pixel-success">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-pixel-dark border-4 border-pixel-accent p-4">
          <p className="text-xs font-pixel text-pixel-warning mb-2">Demo Account:</p>
          <p className="text-xs font-mono text-white">Email: alice@example.com</p>
          <p className="text-xs font-mono text-white">Password: Alice123</p>
        </div>
      </div>
    </div>
  );
}