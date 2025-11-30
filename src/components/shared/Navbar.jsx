import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Trophy, BookOpen } from 'lucide-react';
import { clearAuth, getAuth } from '../../utils/auth';
import PixelButton from './PixelButton';

export default function Navbar() {
  const navigate = useNavigate();
  const { student } = getAuth();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="bg-pixel-dark border-b-4 border-pixel-accent shadow-pixel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-12 h-12 bg-pixel-gold border-4 border-white flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-pixel text-white hidden sm:block">
              StudyQuest
            </span>
          </Link>

          {/* User Info */}
          {student && (
            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-6 text-xs font-pixel">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-pixel-success" />
                  <span className="text-white">{student.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-pixel-warning">LVL</span>
                  <span className="text-white">{student.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-pixel-gold" />
                  <span className="text-white">{student.total_points || 0}</span>
                </div>
              </div>

              {/* Logout */}
              <PixelButton
                variant="danger"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </PixelButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}