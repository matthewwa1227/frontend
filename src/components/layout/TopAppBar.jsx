import React from 'react';
import { cn } from '../../utils/cn';
import { Menu, User, Coins } from 'lucide-react';

/**
 * TopAppBar - Fixed header navigation for StudyQuest
 * Matches Stitch Pixel-Art Design exactly
 * @param {Object} props
 * @param {string} props.title - Page title (uses Press Start 2P font)
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
        "fixed top-0 left-0 right-0 z-50",
        "bg-[#1a063b] border-b-4 border-[#271448]",
        "flex justify-between items-center w-full px-6 py-4",
        "shadow-[4px_4px_0px_0px_rgba(39,20,72,1)]",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-surface-container transition-colors rounded"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-primary" />
          </button>
        )}
        
        {leftAction}
        
        {/* Title with Press Start 2P font */}
        <span className="font-['Press_Start_2P'] text-sm sm:text-lg text-primary truncate">
          {title}
        </span>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* XP/Coins Display - Only show if we have real data */}
        {user?.xp !== undefined && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-container border-2 border-outline-variant">
            <Coins className="w-4 h-4 text-tertiary" />
            <span className="font-['Press_Start_2P'] text-[10px] text-tertiary">
              {user.xp.toLocaleString()}
            </span>
          </div>
        )}
        
        {/* User Avatar / Profile Button */}
        {user?.id ? (
          <button 
            onClick={() => window.location.href = '/profile'}
            className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-primary bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <User className="w-5 h-5 text-primary" />
          </button>
        ) : (
          <button 
            onClick={() => window.location.href = '/profile'}
            className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-primary bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <User className="w-5 h-5 text-primary" />
          </button>
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
    "font-['Press_Start_2P'] text-xl text-primary uppercase",
    className
  )}>
    {children}
  </h1>
);

/**
 * TopAppBarAction - Action button for TopAppBar
 * Using Lucide icons
 */
export const TopAppBarAction = ({ 
  icon: Icon,
  onClick, 
  badge,
  className,
  ariaLabel 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "p-2 hover:bg-surface-container transition-colors relative rounded",
      className
    )}
    aria-label={ariaLabel}
  >
    {Icon && <Icon className="w-5 h-5 text-primary" />}
    {badge && (
      <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse" />
    )}
  </button>
);

export default TopAppBar;
