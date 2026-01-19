import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../../utils/auth';
import { BookOpen, Trophy, Target, LogOut, User, Timer, Users } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't render navbar if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <nav className="bg-pixel-dark border-b-4 border-pixel-accent shadow-pixel">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-pixel-gold border-4 border-white shadow-pixel-sm flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-pixel text-white hidden sm:block">StudyQuest</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard" 
              className="text-xs font-pixel text-white hover:text-pixel-gold transition-colors flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:block">Quests</span>
            </Link>
            
            <Link 
              to="/timer" 
              className="text-xs font-pixel text-white hover:text-pixel-gold transition-colors flex items-center gap-2"
            >
              <Timer className="w-4 h-4" />
              <span className="hidden sm:block">Timer</span>
            </Link>
            
            <Link 
              to="/leaderboard" 
              className="text-xs font-pixel text-white hover:text-pixel-gold transition-colors flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:block">Leaderboard</span>
            </Link>

            {/* --- NEW LINK ADDED HERE --- */}
            <Link 
              to="/portal" 
              className="text-xs font-pixel text-white hover:text-pixel-gold transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:block">Parents</span>
            </Link>
            {/* --------------------------- */}

            <Link 
              to="/profile" 
              className="text-xs font-pixel text-white hover:text-pixel-gold transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:block">Profile</span>
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4 pl-4 border-l-4 border-pixel-accent">
              <div className="text-right hidden md:block">
                <p className="text-xs font-pixel text-pixel-gold">Level {user.level || 1}</p>
                <p className="text-xs font-mono text-gray-400">{user.totalXP || 0} XP</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-xs font-pixel text-white hover:text-red-500 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}