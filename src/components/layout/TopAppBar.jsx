import React from 'react';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';

/**
 * TopAppBar - Fixed header navigation for StudyQuest
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {React.ReactNode} props.leftAction - Left side action (menu button)
 * @param {React.ReactNode} props.rightActions - Right side actions
 * @param {Object} props.user - Current user info
 * @param {boolean} props.transparent - Whether to use transparent background
 * @param {function} props.onMenuClick - Menu button click handler
 * @param {string} props.className - Additional CSS classes
 */
const TopAppBar = ({
  title = "STUDYQUEST",
  leftAction,
  rightActions,
  user,
  transparent = false,
  onMenuClick,
  className = '',
}) => {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16",
        "flex items-center justify-between px-6",
        "border-b-4 border-surface-container",
        transparent 
          ? "bg-surface/90 backdrop-blur-md" 
          : "bg-surface",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-surface-container rounded-none transition-colors"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
        )}
        
        {leftAction}
        
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xl font-black uppercase tracking-tighter",
            "text-primary drop-shadow-[0_0_10px_rgba(255,177,196,0.4)]"
          )}>
            {title}
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 ml-8">
          <a 
            href="#" 
            className="font-label text-[10px] text-primary border-b-2 border-primary pb-1 uppercase tracking-widest"
          >
            Dashboard
          </a>
          <a 
            href="#" 
            className="font-label text-[10px] text-secondary/70 hover:text-primary transition-colors uppercase tracking-widest"
          >
            Quests
          </a>
          <a 
            href="#" 
            className="font-label text-[10px] text-secondary/70 hover:text-primary transition-colors uppercase tracking-widest"
          >
            Guild
          </a>
        </nav>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* XP Display */}
        <div className="hidden sm:flex items-center gap-2 bg-surface-container-high px-3 py-1 border-2 border-outline-variant">
          <span className="material-symbols-outlined text-tertiary text-sm">stars</span>
          <span className="font-pixel text-[10px] text-tertiary">
            {user?.xp?.toLocaleString() || '2,450'}
          </span>
        </div>
        
        {/* Notification Bell */}
        <button className="p-2 hover:bg-surface-container transition-colors relative">
          <span className="material-symbols-outlined text-primary">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error animate-pulse" />
        </button>
        
        {/* User Avatar */}
        {user && (
          <Avatar
            src={user.avatar}
            alt={user.username}
            size="sm"
            variant="primary"
            rpgClass={user.rpgClass || 'scholar'}
            level={user.level}
            onClick={() => {}}
            className="cursor-pointer"
          />
        )}
        
        {rightActions}
      </div>
    </header>
  );
};

/**
 * TopAppBarTitle - Styled title component for TopAppBar
 */
export const TopAppBarTitle = ({ children, className }) => (
  <h1 className={cn(
    "text-xl font-black text-primary uppercase tracking-tighter",
    "font-headline italic",
    className
  )}>
    {children}
  </h1>
);

/**
 * TopAppBarAction - Action button for TopAppBar
 */
export const TopAppBarAction = ({ 
  icon, 
  onClick, 
  badge,
  className,
  ariaLabel 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "p-2 hover:bg-surface-container transition-colors relative",
      className
    )}
    aria-label={ariaLabel}
  >
    <span className="material-symbols-outlined text-primary">{icon}</span>
    {badge && (
      <span className="absolute top-1 right-1 w-2 h-2 bg-error" />
    )}
  </button>
);

export default TopAppBar;
