import React from 'react';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';

/**
 * Navigation item configuration
 * @typedef {Object} NavItem
 * @property {string} id - Unique identifier
 * @property {string} label - Display label
 * @property {string} icon - Material Symbols icon name
 * @property {string} href - Navigation href
 * @property {boolean} active - Whether item is active
 * @property {string} badge - Optional badge text
 * @property {function} onClick - Click handler
 */

/**
 * SideNavBar - Fixed side navigation for StudyQuest
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50",
          "bg-surface-container border-r-4 border-surface",
          "shadow-[6px_0px_0px_0px_rgba(21,1,54,1)]",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "w-64",
          // Mobile positioning
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop positioning
          "lg:translate-x-0 lg:pt-20",
          className
        )}
      >
        {/* User Section (Desktop) */}
        {user && (
          <div className="hidden lg:block p-6 border-b-4 border-surface mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar}
                alt={user.username}
                size="md"
                variant="primary"
                rpgClass={user.rpgClass || 'scholar'}
              />
              <div>
                <div className="font-pixel text-[10px] text-tertiary">
                  LEVEL {user.level || 42}
                </div>
                <div className="font-pixel text-[8px] text-primary mt-1">
                  HERO POWER: {user.heroPower || '9000'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <NavItem
              key={item.id}
              {...item}
            />
          ))}
        </nav>
        
        {/* Shadow Warning (if applicable) */}
        {user?.shadowLevel > 0 && (
          <div className="px-4 py-3 mt-auto border-t-4 border-surface bg-surface-container-low">
            <div className="flex items-center gap-3 p-3 text-error font-pixel text-[10px]">
              <span className="material-symbols-outlined">warning</span>
              SHADOW: {user.shadowLevel}%
            </div>
          </div>
        )}
        
        {/* Footer */}
        {footer && (
          <div className="p-4 border-t-4 border-surface">
            {footer}
          </div>
        )}
        
        {/* Settings Link */}
        <div className="p-4 border-t-2 border-surface-container-high">
          <button className="flex items-center gap-3 p-3 text-secondary/80 hover:text-primary transition-colors font-pixel text-[10px] uppercase w-full">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};

/**
 * NavItem - Individual navigation item
 */
const NavItem = ({ 
  id, 
  label, 
  icon, 
  href = '#', 
  active = false, 
  badge, 
  onClick,
  variant = 'default'
}) => {
  const baseStyles = "flex items-center gap-3 p-4 font-pixel text-[10px] uppercase transition-all duration-75";
  
  const variants = {
    default: {
      active: "bg-primary text-on-primary shadow-pixel-primary",
      inactive: "text-secondary/80 hover:bg-surface-container-high hover:text-primary",
    },
    secondary: {
      active: "bg-secondary-container text-on-secondary shadow-pixel-secondary",
      inactive: "text-secondary/80 hover:bg-surface-container-high hover:text-secondary",
    },
    ghost: {
      active: "border-l-4 border-primary text-primary bg-surface-container-high",
      inactive: "text-secondary/80 hover:translate-x-1 hover:text-primary",
    },
  };
  
  const selectedVariant = variants[variant];
  
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        baseStyles,
        active ? selectedVariant.active : selectedVariant.inactive
      )}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className={cn(
          "px-1.5 py-0.5 text-[6px]",
          active ? "bg-on-primary/20" : "bg-primary/20 text-primary"
        )}>
          {badge}
        </span>
      )}
    </a>
  );
};

/**
 * Default navigation items for StudyQuest
 */
export const defaultNavItems = [
  { id: 'study', label: 'Study', icon: 'menu_book', href: '#', active: true },
  { id: 'ai-tutor', label: 'AI Tutor', icon: 'psychology', href: '#' },
  { id: 'social', label: 'Social', icon: 'groups', href: '#' },
  { id: 'tasks', label: 'Tasks', icon: 'checklist', href: '#', badge: '3' },
  { id: 'progress', label: 'Progress', icon: 'trending_up', href: '#' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory_2', href: '#' },
];

/**
 * BottomNavBar - Mobile bottom navigation
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
      "bg-surface border-t-4 border-surface-container",
      "h-16 px-6 z-50",
      "flex justify-between items-center",
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
              "transition-colors duration-75",
              isActive ? "text-primary" : "text-secondary/70 hover:text-primary"
            )}
          >
            <span className={cn(
              "material-symbols-outlined",
              isActive && "fill"
            )}>
              {item.icon}
            </span>
            <span className="font-pixel text-[8px]">
              {item.label.split(' ')[0].toUpperCase()}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default SideNavBar;
