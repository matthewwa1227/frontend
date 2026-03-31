import React from 'react';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';

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
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-[#271448] transition-colors"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
        )}
        
        {leftAction}
        
        {/* Title with Press Start 2P font */}
        <span className="font-['Press_Start_2P'] text-lg text-[#ffb1c4]">
          {title}
        </span>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 font-['Space_Grotesk'] tracking-tighter uppercase font-bold ml-8">
          <a 
            href="#" 
            className="text-[#ffb1c4] border-b-2 border-[#ffb1c4] py-1 transition-all steps-5 hover:bg-[#271448]"
          >
            DASHBOARD
          </a>
          <a 
            href="#" 
            className="text-[#ddfcff] opacity-70 py-1 transition-all steps-5 hover:bg-[#271448] hover:text-[#ffb1c4] hover:opacity-100"
          >
            INVENTORY
          </a>
          <a 
            href="#" 
            className="text-[#ddfcff] opacity-70 py-1 transition-all steps-5 hover:bg-[#271448] hover:text-[#ffb1c4] hover:opacity-100"
          >
            GUILDS
          </a>
        </nav>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* XP/Coins Display - Only show if we have real data */}
        {user?.xp !== undefined && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-surface-container border-2 border-outline-variant">
            <span className="material-symbols-outlined text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>monetization_on</span>
            <span className="font-['Press_Start_2P'] text-[10px] text-tertiary">
              {user.xp.toLocaleString()}
            </span>
          </div>
        )}
        
        {/* Quest Log Button */}
        <button className="hidden sm:block bg-primary-container text-on-primary-container font-['Press_Start_2P'] text-[10px] px-4 py-2 shadow-[3px_3px_0px_0px_#8f0044] active:translate-y-1 transition-transform">
          QUEST LOG
        </button>
        
        {/* User Avatar - Only show if we have real data */}
        {user?.id && (
          <div className="w-10 h-10 border-2 border-primary overflow-hidden">
            <Avatar
              src={user.avatar}
              alt={user.username || 'User'}
              size="sm"
              variant="primary"
              rpgClass={user.rpgClass || 'scholar'}
              level={user.level}
              onClick={() => {}}
              className="cursor-pointer w-full h-full"
            />
          </div>
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
      <span className="absolute top-1 right-1 w-2 h-2 bg-error animate-pulse" />
    )}
  </button>
);

export default TopAppBar;
