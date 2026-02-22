import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../../utils/auth';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  LogOut, 
  User, 
  Timer, 
  Users, 
  Bot, 
  CalendarDays,
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  CheckSquare,
  TrendingUp
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't render navbar if user is not logged in
  if (!user) {
    return null;
  }

  // Check if a path is active
  const isActive = (path) => location.pathname === path;

  // Main navigation items
  const mainNavItems = [
    { path: '/dashboard', label: 'Quests', icon: Target },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/timer', label: 'Timer', icon: Timer },
    { path: '/progress', label: 'Progress', icon: TrendingUp },
    { path: '/social', label: 'Social', icon: Users },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  // AI Tools dropdown items
  const aiTools = [
    { path: '/study-buddy', label: 'AI Study Buddy', icon: Bot, description: 'Chat & get help' },
    { path: '/tutor', label: 'AI Tutor', icon: GraduationCap, description: 'Learn with guidance' },
    { path: '/schedule', label: 'Schedule Generator', icon: CalendarDays, description: 'Plan your study time' },
  ];

  // Secondary nav items
  const secondaryNavItems = [
    { path: '/portal', label: 'Parents', icon: Users },
    ...(user?.role === 'teacher' ? [{ path: '/teacher', label: 'Teacher', icon: GraduationCap }] : []),
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-pixel-dark border-b-4 border-pixel-accent shadow-pixel relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-pixel-gold border-4 border-white shadow-pixel-sm flex items-center justify-center">
              <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-lg lg:text-xl font-pixel text-white hidden sm:block">
              StudyQuest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Main Nav Items */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-xs font-pixel transition-all flex items-center gap-2 border-b-4 ${
                    isActive(item.path)
                      ? 'text-pixel-gold border-pixel-gold bg-pixel-primary'
                      : 'text-white border-transparent hover:text-pixel-gold hover:border-pixel-gold/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* AI Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
                onBlur={() => setTimeout(() => setAiDropdownOpen(false), 200)}
                className={`px-3 py-2 text-xs font-pixel transition-all flex items-center gap-2 border-b-4 ${
                  aiTools.some(tool => isActive(tool.path))
                    ? 'text-pixel-gold border-pixel-gold bg-pixel-primary'
                    : 'text-white border-transparent hover:text-pixel-gold hover:border-pixel-gold/50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Tools</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${aiDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {aiDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-pixel-primary border-4 border-pixel-accent shadow-pixel z-50">
                  {aiTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-pixel-secondary transition-colors ${
                          isActive(tool.path) ? 'bg-pixel-secondary' : ''
                        }`}
                      >
                        <Icon className={`w-5 h-5 mt-0.5 ${isActive(tool.path) ? 'text-pixel-gold' : 'text-gray-400'}`} />
                        <div>
                          <p className={`text-xs font-pixel ${isActive(tool.path) ? 'text-pixel-gold' : 'text-white'}`}>
                            {tool.label}
                          </p>
                          <p className="text-xs text-gray-500">{tool.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Secondary Nav Items */}
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-xs font-pixel transition-all flex items-center gap-2 border-b-4 ${
                    isActive(item.path)
                      ? 'text-pixel-gold border-pixel-gold bg-pixel-primary'
                      : 'text-white border-transparent hover:text-pixel-gold hover:border-pixel-gold/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* XP Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-pixel-primary border-2 border-pixel-accent">
              <div className="w-6 h-6 bg-pixel-gold border-2 border-white flex items-center justify-center">
                <span className="text-xs font-pixel text-black">{user.level || 1}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-pixel text-pixel-gold leading-none">{user.totalXP || 0}</p>
                <p className="text-xs text-gray-500 leading-none">XP</p>
              </div>
            </div>

            {/* Logout Button - Desktop */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-xs font-pixel text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-pixel-gold transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-pixel-dark border-b-4 border-pixel-accent shadow-pixel z-50">
          <div className="px-4 py-4 space-y-1">
            {/* Main Nav */}
            <p className="text-xs text-gray-500 font-pixel px-3 py-2">MAIN</p>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 text-sm font-pixel transition-colors ${
                    isActive(item.path)
                      ? 'text-pixel-gold bg-pixel-primary border-l-4 border-pixel-gold'
                      : 'text-white hover:bg-pixel-primary border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* AI Tools */}
            <p className="text-xs text-gray-500 font-pixel px-3 py-2 pt-4">AI TOOLS</p>
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 text-sm font-pixel transition-colors ${
                    isActive(tool.path)
                      ? 'text-pixel-gold bg-pixel-primary border-l-4 border-pixel-gold'
                      : 'text-white hover:bg-pixel-primary border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tool.label}</span>
                </Link>
              );
            })}

            {/* Secondary */}
            <p className="text-xs text-gray-500 font-pixel px-3 py-2 pt-4">MORE</p>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 text-sm font-pixel transition-colors ${
                    isActive(item.path)
                      ? 'text-pixel-gold bg-pixel-primary border-l-4 border-pixel-gold'
                      : 'text-white hover:bg-pixel-primary border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* User Info & Logout */}
            <div className="border-t-2 border-pixel-accent mt-4 pt-4">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pixel-gold border-2 border-white flex items-center justify-center">
                    <span className="text-sm font-pixel text-black">{user.level || 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-pixel text-white">{user.username || 'Player'}</p>
                    <p className="text-xs text-pixel-gold">{user.totalXP || 0} XP</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-pixel transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}