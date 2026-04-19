import React from 'react';
import { cn } from '../../utils/cn';
import { 
  Target, 
  CheckSquare, 
  Timer, 
  TrendingUp, 
  Users, 
  Trophy,
  MessageCircle,
  Bot,
  Calendar,
  FileText,
  Users2,
  User,
  Settings,
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  GraduationCap,
  BookOpen
} from 'lucide-react';

/**
 * Navigation item configuration
 * @typedef {Object} NavItem
 * @property {string} id - Unique identifier
 * @property {string} label - Display label (uppercase)
 * @property {string} icon - Icon component name
 * @property {string} href - Navigation href
 * @property {boolean} active - Whether item is active
 * @property {string} badge - Optional badge text
 * @property {function} onClick - Click handler
 * @property {string} category - Category for grouping (main, study, more)
 */

// Icon mapping for navigation items
const navIcons = {
  dashboard: Target,
  tasks: CheckSquare,
  timer: Timer,
  progress: TrendingUp,
  social: Users,
  leaderboard: Trophy,
  'study-buddy': MessageCircle,
  'story-quest': Bot,
  schedule: Calendar,
  'exercise-gen': FileText,
  portal: Users2,
  profile: User,
  settings: Settings,
  teacher: GraduationCap,
  sparkles: Sparkles,
  'book-open': BookOpen,
  // Additional icons from Dashboard.jsx
  target: Target,
  checklist: CheckSquare,
  groups: Users,
  trending_up: TrendingUp,
  chat: MessageCircle,
  smart_toy: Bot,
  calendar_month: Calendar,
  edit_document: FileText,
  family_restroom: Users2,
  person: User,
};

/**
 * Complete navigation items for StudyQuest
 * Migrated from old Navbar.jsx
 */
export const defaultNavItems = [
  // Main Navigation
  { id: 'dashboard', label: 'DASHBOARD', icon: 'dashboard', href: '/dashboard', category: 'main' },
  { id: 'tasks', label: 'QUEST LOG', icon: 'tasks', href: '/tasks', category: 'main' },
  { id: 'timer', label: 'CHAMBER OF FOCUS', icon: 'timer', href: '/timer', category: 'main' },
  { id: 'progress', label: 'PROGRESS', icon: 'progress', href: '/progress', category: 'main' },
  { id: 'social', label: 'SOCIAL', icon: 'social', href: '/social', category: 'main' },
  { id: 'leaderboard', label: 'LEADERBOARD', icon: 'leaderboard', href: '/leaderboard', category: 'main' },
  
  // Study Tools (formerly AI Tools)
  { id: 'study-buddy', label: 'STUDY BUDDY', icon: 'study-buddy', href: '/study-buddy', category: 'study' },
  { id: 'newquest', label: 'NEWQUEST', icon: 'smart_toy', href: '/newquest', category: 'study' },
  { id: 'archive', label: 'ARCHIVE', icon: 'book-open', href: '/archive-alchemist', category: 'study' },
  { id: 'schedule', label: 'SCHEDULE', icon: 'schedule', href: '/schedule', category: 'study' },
  { id: 'exercise-gen', label: 'EXERCISE GEN', icon: 'exercise-gen', href: '/exercise-generator', category: 'study' },
  
  // More
  { id: 'portal', label: 'PARENTS', icon: 'portal', href: '/portal', category: 'more' },
  { id: 'profile', label: 'PROFILE', icon: 'profile', href: '/profile', category: 'more' },
  { id: 'teacher', label: 'TEACHER', icon: 'teacher', href: '/teacher', category: 'more', role: 'teacher' },
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Using theme colors */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-surface-container border-r-4 border-surface",
          "shadow-pixel-lg z-40 flex flex-col",
          // Mobile: slide in/out
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0",
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 bg-surface border-b-4 border-surface flex items-center px-4 lg:hidden">
          <span className="font-['Press_Start_2P'] text-sm text-primary">MENU</span>
          <button 
            onClick={onClose}
            className="ml-auto p-2 text-secondary hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Section - Level & Hero Power */}
        <div className="px-4 py-4 border-b-4 border-surface bg-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-tertiary border-2 border-tertiary flex items-center justify-center shadow-pixel-sm">
              <span className="font-['Press_Start_2P'] text-sm text-on-tertiary">
                {user?.level || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-['Press_Start_2P'] text-[10px] text-tertiary mb-1 truncate">
                {user?.username || 'HERO'}
              </h2>
              <p className="font-['Press_Start_2P'] text-[8px] text-secondary opacity-80">
                LVL {user?.level || 1} • {user?.xp || 0} XP
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation Items - Scrollable */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto scrollbar-pixel">
          {/* Main Section - Only show if has items */}
          {mainItems.length > 0 && (
            <div className="mb-4">
              <p className="px-3 py-2 text-[8px] text-secondary/50 font-['Press_Start_2P'] uppercase tracking-wider">
                Main
              </p>
              {mainItems.map((item) => (
                <NavItem
                  key={item.id}
                  {...item}
                  active={activeItem === item.id}
                  onClick={() => onItemClick?.(item.id)}
                />
              ))}
            </div>
          )}
          
          {/* Study Tools Section - Only show if has items */}
          {studyItems.length > 0 && (
            <div className="mb-4">
              <p className="px-3 py-2 text-[8px] text-secondary/50 font-['Press_Start_2P'] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Study Tools
              </p>
              {studyItems.map((item) => (
                <NavItem
                  key={item.id}
                  {...item}
                  active={activeItem === item.id}
                  onClick={() => onItemClick?.(item.id)}
                />
              ))}
            </div>
          )}
          
          {/* More Section - Only show if has items */}
          {moreItems.length > 0 && (
            <div className="mb-4">
              <p className="px-3 py-2 text-[8px] text-secondary/50 font-['Press_Start_2P'] uppercase tracking-wider">
                More
              </p>
              {moreItems.map((item) => {
                // Skip teacher link if user is not a teacher
                if (item.role === 'teacher' && user?.role !== 'teacher') return null;
                return (
                  <NavItem
                    key={item.id}
                    {...item}
                    active={activeItem === item.id}
                    onClick={() => onItemClick?.(item.id)}
                  />
                );
              })}
            </div>
          )}
        </nav>
        
        {/* Footer with Settings and Shadow Warning */}
        <div className="p-3 mt-auto border-t-4 border-surface bg-surface-container">
          {/* Settings */}
          <a
            href="/settings"
            className="flex items-center gap-3 px-3 py-3 mb-2 text-secondary/80 hover:text-primary hover:bg-surface-container-high transition-all font-['Press_Start_2P'] text-[10px] uppercase w-full"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate">SETTINGS</span>
          </a>
          
          {/* Shadow Warning */}
          <div className="flex items-center gap-2 px-3 py-2 text-error font-['Press_Start_2P'] text-[8px] bg-error/10 border border-error/20">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">SHADOW: {user?.shadowLevel || user?.shadow_level || 0}%</span>
          </div>
        </div>
      </aside>
    </>
  );
};

/**
 * NavItem - Individual navigation item
 * Using theme colors and Lucide icons
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
  const IconComponent = navIcons[icon] || Target;
  
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
        "flex items-center gap-3 px-3 py-3 mb-1 font-['Press_Start_2P'] text-[10px] uppercase transition-all duration-150 rounded-sm",
        active 
          ? "bg-primary text-on-primary shadow-pixel-primary translate-y-[-2px]" 
          : "text-secondary/80 hover:bg-secondary/10 hover:text-secondary hover:translate-x-1"
      )}
    >
      <IconComponent className={cn(
        "w-4 h-4 flex-shrink-0",
        active ? "text-on-primary" : "text-secondary/60"
      )} />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className={cn(
          "px-1.5 py-0.5 text-[6px] font-bold rounded-sm",
          active 
            ? "bg-on-primary/20 text-on-primary" 
            : "bg-tertiary/20 text-tertiary"
        )}>
          {badge}
        </span>
      )}
    </a>
  );
};

/**
 * BottomNavBar - Mobile bottom navigation
 * Using theme colors and Lucide icons
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
      "lg:hidden fixed bottom-0 left-0 right-0",
      "bg-surface border-t-4 border-surface-container",
      "px-4 py-2 flex justify-around items-center z-50 pb-safe",
      className
    )}>
      {items.map((item) => {
        const isActive = item.id === activeItem;
        const IconComponent = navIcons[item.icon] || Target;
        
        return (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 rounded transition-all",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-secondary/70 hover:text-secondary hover:bg-secondary/5"
            )}
          >
            <IconComponent className="w-5 h-5" />
            <span className="font-['Press_Start_2P'] text-[7px]">
              {item.label.split(' ')[0].toUpperCase()}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default SideNavBar;
