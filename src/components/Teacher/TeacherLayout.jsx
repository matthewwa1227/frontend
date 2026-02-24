import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../../utils/auth';
import { 
  BookOpen, Users, GraduationCap, Trophy, LogOut, 
  Target, BarChart3, Settings, Home
} from 'lucide-react';

const pixelText = { fontFamily: 'monospace' };

export default function TeacherLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/teacher', label: 'Dashboard', icon: Home },
    { path: '/teacher/classes', label: 'My Classes', icon: Users },
    { path: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/teacher/students', label: 'All Students', icon: GraduationCap },
    { path: '/teacher/challenges', label: 'Challenges', icon: Trophy },
    { path: '/teacher/verify', label: 'Verify Sessions', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Teacher Navbar */}
      <nav className="bg-indigo-900 border-b-4 border-indigo-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/teacher" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white" style={pixelText}>StudyQuest</span>
                <span className="text-xs text-indigo-300 block" style={pixelText}>TEACHER PORTAL</span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 rounded-lg ${
                      isActive(item.path)
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                    }`}
                    style={pixelText}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-white text-sm font-bold" style={pixelText}>{user?.username}</p>
                <p className="text-indigo-400 text-xs" style={pixelText}>Teacher</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
