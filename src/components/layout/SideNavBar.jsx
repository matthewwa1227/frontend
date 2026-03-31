import React from 'react';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';

/**
 * Navigation item configuration
 * @typedef {Object} NavItem
 * @property {string} id - Unique identifier
 * @property {string} label - Display label (uppercase)
 * @property {string} icon - Material Symbols icon name
 * @property {string} href - Navigation href
 * @property {boolean} active - Whether item is active
 * @property {string} badge - Optional badge text
 * @property {function} onClick - Click handler
 * @property {string} category - Category for grouping (main, study, more)
 */

/**
 * Complete navigation items for StudyQuest
 * Migrated from old Navbar.jsx
 */
export const defaultNavItems = [
  // Main Navigation
  { id: 'dashboard', label: 'DASHBOARD', icon: 'target', href: '/dashboard', category: 'main' },
  { id: 'tasks', label: 'TASKS', icon: 'checklist', href: '/tasks', category: 'main', badge: '3' },
  { id: 'timer', label: 'TIMER', icon: 'timer', href: '/timer', category: 'main' },
  { id: 'progress', label: 'PROGRESS', icon: 'trending_up', href: '/progress', category: 'main' },
  { id: 'social', label: 'SOCIAL', icon: 'groups', href: '/social', category: 'main' },
  { id: 'leaderboard', label: 'LEADERBOARD', icon: 'trophy', href: '/leaderboard', category: 'main' },
  
  // Study Tools (formerly AI Tools)
  { id: 'study-tools', label: 'STUDY TOOLS', icon: 'auto_awesome', href: '#', category: 'divider' },
  { id: 'study-buddy', label: 'STUDY BUDDY', icon: 'chat', href: '/study-buddy', category: 'study' },
  { id: 'story-quest', label: 'STORY QUEST', icon: 'smart_toy', href: '/story-quest', category: 'study' },
  { id: 'schedule', label: 'SCHEDULE', icon: 'calendar_month', href: '/schedule', category: 'study' },
  { id: 'exercise-gen', label: 'EXERCISE GEN', icon: 'edit_document', href: '/exercise-generator', category: 'study' },
  
  // More
  { id: 'more', label: 'MORE', icon: 'more_horiz', href: '#', category: 'divider' },
  { id: 'portal', label: 'PARENTS', icon: 'family_restroom', href: '/portal', category: 'more' },
  { id: 'profile', label: 'PROFILE', icon: 'person', href: '/profile', category: 'more' },
];

/**
 * SideNavBar - Fixed side navigation for StudyQuest
 * Matches Stitch Pixel-Art Design exactly
 * Updated with all navigation items from old Navbar
 * @param {Object} props
 * @param {NavItem[]} props.items - Navigation items
 * @param {Object} props.user - Current user info
 * @param {boolean} props.isOpen - Whether sidebar is open (mobile)
 * @param {function} props.onClose - Close handler (mobile)
 * @param {string} props.activeItem - Currently active item ID
 * @param {function} props.onItemClick - Item click handler
 * @param {string} props.className - Additional CSS classes
 */
const SideNavBar = ({
  items = defaultNavItems,
  user,
  isOpen = false,
  onClose,
  activeItem = 'dashboard',
  onItemClick,
  className = '',
}) => {
  // Filter out divider items for actual nav rendering
  const navItems = items.filter(item => item.category !== 'divider');
  
  // Group items by category
  const mainItems = navItems.filter(item => item.category === 'main');
  const studyItems = navItems.filter(item => item.category === 'study');
  const moreItems = navItems.filter(item => item.category === 'more');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Matches Stitch HTML */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-[#271448] border-r-4 border-[#1a063b]",
          "shadow-[6px_0px_0px_0px_rgba(26,6,59,1)]",
          "z-40 hidden md:flex flex-col pt-20",
          className
        )}
      >
        {/* User Section - Level & Hero Power - Only show if we have real data */}
        {user?.level && (
          <div className="px-4 mb-6 py-4 border-b-4 border-[#1a063b]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tertiary border-2 border-white flex items-center justify-center">
                <span className="font-['Press_Start_2P'] text-xs text-black">{user.level}</span>
              </div>
              <div>
                <h2 className="font-['Press_Start_2P'] text-[10px] text-tertiary mb-1">LEVEL {user.level}</h2>
                <p className="font-['Press_Start_2P'] text-[8px] text-primary opacity-80">XP: {user.xp || 0}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Items - Scrollable */}
        <nav className="flex-1 px-3 overflow-y-auto">
          {/* Main Section */}
          <div className="mb-2">
            <p className="px-4 py-2 text-[8px] text-[#ddfcff]/50 font-['Press_Start_2P'] uppercase">Main</p>
            {mainItems.map((item) => (
              <NavItem
                key={item.id}
                {...item}
                active={activeItem === item.id}
                onClick={() => onItemClick?.(item.id)}
              />
            ))}
          </div>
          
          {/* Study Tools Section */}
          <div className="mb-2">
            <p className="px-4 py-2 text-[8px] text-[#ddfcff]/50 font-['Press_Start_2P'] uppercase">Study Tools</p>
            {studyItems.map((item) => (
              <NavItem
                key={item.id}
                {...item}
                active={activeItem === item.id}
                onClick={() => onItemClick?.(item.id)}
              />
            ))}
          </div>
          
          {/* More Section */}
          <div className="mb-2">
            <p className="px-4 py-2 text-[8px] text-[#ddfcff]/50 font-['Press_Start_2P'] uppercase">More</p>
            {moreItems.map((item) => (
              <NavItem
                key={item.id}
                {...item}
                active={activeItem === item.id}
                onClick={() => onItemClick?.(item.id)}
              />
            ))}
          </div>
        </nav>
        
        {/* Footer with Settings and Shadow Warning */}
        <div className="p-4 mt-auto border-t-4 border-[#1a063b]">
          {/* Settings */}
          <a
            href="/settings"
            className="flex items-center gap-3 p-4 mb-2 text-[#ddfcff] opacity-80 hover:text-primary transition-colors font-['Press_Start_2P'] text-[10px] uppercase w-full text-left hover:bg-[#271448]"
          >
            <span className="material-symbols-outlined">settings</span>
            SETTINGS
          </a>
          
          {/* Shadow Warning */}
          <div className="flex items-center gap-3 p-4 text-error font-['Press_Start_2P'] text-[10px]">
            <span className="material-symbols-outlined">warning</span>
            SHADOW: {user?.shadowLevel || user?.shadow_level || 0}%
          </div>
        </div>
      </aside>
    </>
  );
};

/**
 * NavItem - Individual navigation item
 * Matches Stitch HTML styling exactly
 */
const NavItem = ({ 
  id, 
  label, 
  icon, 
  href = '#', 
  active = false, 
  badge, 
  onClick,
}) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(id);
        }
      }}
      className={cn(
        "flex items-center gap-3 p-3 mb-1 font-['Press_Start_2P'] text-[10px] uppercase transition-all duration-75",
        active 
          ? "bg-[#ffb1c4] text-[#1a063b] shadow-[4px_4px_0px_0px_#ff4a8d]" 
          : "text-[#ddfcff] opacity-80 hover:bg-[#ddfcff] hover:text-[#1a063b] hover:opacity-100"
      )}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className={cn(
          "px-1.5 py-0.5 text-[6px]",
          active ? "bg-[#1a063b]/20" : "bg-primary/20 text-primary"
        )}>
          {badge}
        </span>
      )}
    </a>
  );
};

/**
 * BottomNavBar - Mobile bottom navigation
 * Matches Stitch HTML exactly
 * @param {Object} props
 * @param {NavItem[]} props.items - Navigation items (max 5)
 * @param {string} props.activeItem - Currently active item ID
 * @param {function} props.onItemClick - Item click handler
 */
export const BottomNavBar = ({
  items = defaultNavItems.filter(i => i.category === 'main').slice(0, 4),
  activeItem = 'dashboard',
  onItemClick,
  className,
}) => {
  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0",
      "bg-[#1a063b] border-t-4 border-[#271448]",
      "px-6 py-2 flex justify-between items-center z-50",
      className
    )}>
      {items.map((item) => {
        const isActive = item.id === activeItem;
        return (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={cn(
              "flex flex-col items-center gap-1",
              isActive ? "text-[#ffb1c4]" : "text-[#ddfcff] opacity-70"
            )}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-['Press_Start_2P'] text-[8px]">
              {item.label.split(' ')[0].toUpperCase()}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default SideNavBar;
