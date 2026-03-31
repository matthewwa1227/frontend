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
 */

/**
 * SideNavBar - Fixed side navigation for StudyQuest
 * Matches Stitch Pixel-Art Design exactly
 * @param {Object} props
 * @param {NavItem[]} props.items - Navigation items
 * @param {Object} props.user - Current user info
 * @param {boolean} props.isOpen - Whether sidebar is open (mobile)
 * @param {function} props.onClose - Close handler (mobile)
 * @param {React.ReactNode} props.footer - Footer content
 * @param {string} props.className - Additional CSS classes
 */
const SideNavBar = ({
  items = defaultNavItems,
  user,
  isOpen = false,
  onClose,
  footer,
  className = '',
}) => {
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
          "z-40 hidden md:flex flex-col pt-24",
          className
        )}
      >
        {/* User Section - Level & Hero Power - Only show if we have real data */}
        {user?.level && (
          <div className="px-6 mb-8">
            <h2 className="font-['Press_Start_2P'] text-sm text-tertiary mb-1">LEVEL {user.level}</h2>
            <p className="font-['Press_Start_2P'] text-[10px] text-primary opacity-80">HERO POWER: {user.heroPower || user.xp || '...'}</p>
          </div>
        )}
        
        {/* Navigation Items */}
        <nav className="flex-1 px-3">
          {items.map((item) => (
            <NavItem
              key={item.id}
              {...item}
            />
          ))}
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
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4 mb-2 font-['Press_Start_2P'] text-[10px] uppercase transition-all duration-75",
        active 
          ? "bg-[#ffb1c4] text-[#1a063b] shadow-[4px_4px_0px_0px_#ff4a8d]" 
          : "text-[#ddfcff] opacity-80 hover:bg-[#ddfcff] hover:text-[#1a063b] hover:opacity-100"
      )}
    >
      <span className="material-symbols-outlined">{icon}</span>
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
 * Default navigation items for StudyQuest
 * Using Material Symbols icon names
 */
export const defaultNavItems = [
  { id: 'study', label: 'STUDY', icon: 'menu_book', href: '#', active: true },
  { id: 'ai-tutor', label: 'AI TUTOR', icon: 'smart_toy', href: '#' },
  { id: 'social', label: 'SOCIAL', icon: 'groups', href: '#' },
  { id: 'tasks', label: 'TASKS', icon: 'checklist', href: '#', badge: '3' },
];

/**
 * BottomNavBar - Mobile bottom navigation
 * Matches Stitch HTML exactly
 * @param {Object} props
 * @param {NavItem[]} props.items - Navigation items (max 5)
 * @param {string} props.activeItem - Currently active item ID
 * @param {function} props.onItemClick - Item click handler
 */
export const BottomNavBar = ({
  items = defaultNavItems.slice(0, 4),
  activeItem = 'study',
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
