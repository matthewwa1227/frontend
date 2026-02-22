import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { setAuth } from '../../utils/auth';
import PixelButton from '../shared/PixelButton';
import { BookOpen, Mail, Lock, User, UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    fullName: '',
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
      const response = await authAPI.register(formData);
      const { token, student } = response.data.data;
      setAuth(token, student);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <p className="text-xs font-pixel text-gray-400">Begin Your Journey</p>
        </div>

        {/* Register Form */}
        <div className="pixel-card">
          <h2 className="text-lg font-pixel text-pixel-gold mb-6 text-center">
            Create Account
          </h2>

          {error && (
            <div className="bg-red-900 border-4 border-red-500 p-4 mb-6">
              <p className="text-xs font-pixel text-white text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-xs font-pixel text-white mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full px-4 py-3 bg-pixel-primary border-4 border-pixel-accent text-white font-mono focus:border-pixel-gold focus:outline-none"
                placeholder="DragonSlayer99"
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-3 bg-pixel-primary border-4 border-pixel-accent text-white font-mono focus:border-pixel-gold focus:outline-none"
                placeholder="••••••••"
              />
              <p className="text-xs font-mono text-gray-400 mt-2">
                Min 6 characters
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-pixel text-white mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Full Name (optional)
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-pixel-primary border-4 border-pixel-accent text-white font-mono focus:border-pixel-gold focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-pixel text-white mb-2">
                <UserPlus className="inline w-4 h-4 mr-2" />
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-pixel-primary border-4 border-pixel-accent text-white font-mono focus:border-pixel-gold focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            {/* Submit Button */}
            <PixelButton
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating...' : 'Join Quest'}
            </PixelButton>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-xs font-pixel text-gray-400">
              Already Playing?{' '}
              <Link to="/login" className="text-pixel-gold hover:text-pixel-success">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}