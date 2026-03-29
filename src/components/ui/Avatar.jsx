import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Avatar - A pixel-art styled avatar component with RPG class variants
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for image
 * @param {string} props.size - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.variant - 'default' | 'primary' | 'secondary' | 'tertiary' | 'gold'
 * @param {string} props.rpgClass - 'warrior' | 'mage' | 'archer' | 'scholar' | 'default'
 * @param {boolean} props.border - Whether to show border
 * @param {boolean} props.glow - Whether to add glow effect
 * @param {number} props.level - Level to display
 * @param {React.ReactNode} props.badge - Optional badge element
 * @param {function} props.onClick - Optional click handler
 * @param {string} props.className - Additional CSS classes
 */
const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  variant = 'default',
  rpgClass = 'default',
  border = true,
  glow = false,
  level,
  badge,
  onClick,
  className = '',
  ...props
}) => {
  const sizes = {
    xs: { container: 'w-8 h-8', icon: 'text-sm' },
    sm: { container: 'w-10 h-10', icon: 'text-lg' },
    md: { container: 'w-12 h-12', icon: 'text-xl' },
    lg: { container: 'w-16 h-16', icon: 'text-2xl' },
    xl: { container: 'w-20 h-20', icon: 'text-3xl' },
    '2xl': { container: 'w-24 h-24', icon: 'text-4xl' },
  };
  
  const variants = {
    default: {
      border: 'border-outline-variant',
      bg: 'bg-surface-container-highest',
    },
    primary: {
      border: 'border-primary',
      bg: 'bg-surface-container',
      glow: 'shadow-glow-primary',
    },
    secondary: {
      border: 'border-secondary',
      bg: 'bg-surface-container',
      glow: 'shadow-glow-secondary',
    },
    tertiary: {
      border: 'border-tertiary',
      bg: 'bg-surface-container',
      glow: 'shadow-glow-tertiary',
    },
    gold: {
      border: 'border-tertiary',
      bg: 'bg-tertiary/10',
      glow: 'shadow-glow-tertiary',
    },
  };
  
  const rpgClasses = {
    default: 'person',
    warrior: 'swords',
    mage: 'auto_fix_high',
    archer: 'navigation',
    scholar: 'school',
    healer: 'favorite',
    rogue: 'visibility_off',
    paladin: 'shield',
    archmage: 'psychology',
  };
  
  const selectedSize = sizes[size];
  const selectedVariant = variants[variant];
  const Icon = rpgClasses[rpgClass] || rpgClasses.default;
  
  return (
    <div className={cn("relative inline-block", className)} {...props}>
      <div
        onClick={onClick}
        className={cn(
          selectedSize.container,
          selectedVariant.bg,
          border && `border-2 ${selectedVariant.border}`,
          glow && selectedVariant.glow,
          onClick && 'cursor-pointer hover:scale-105 transition-transform',
          'flex items-center justify-center overflow-hidden'
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover image-pixelated"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={cn(
            "w-full h-full flex items-center justify-center",
            src && "hidden"
          )}
        >
          <span className={cn(
            "material-symbols-outlined",
            selectedSize.icon,
            variant === 'primary' && 'text-primary',
            variant === 'secondary' && 'text-secondary',
            variant === 'tertiary' && 'text-tertiary',
            variant === 'default' && 'text-on-surface-variant'
          )}>
            {Icon}
          </span>
        </div>
      </div>
      
      {/* Level Badge */}
      {level !== undefined && (
        <div className="absolute -bottom-1 -right-1 bg-tertiary text-on-tertiary px-1.5 py-0.5 font-pixel text-[6px] border border-on-tertiary">
          LVL {level}
        </div>
      )}
      
      {/* Custom Badge */}
      {badge && (
        <div className="absolute -top-1 -right-1">
          {badge}
        </div>
      )}
    </div>
  );
};

/**
 * AvatarGroup - Display multiple avatars in a stack
 */
export const AvatarGroup = ({
  children,
  max = 4,
  size = 'md',
  className,
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;
  
  return (
    <div className={cn("flex -space-x-2", className)}>
      {visibleChildren.map((child, idx) => (
        <div key={idx} className="relative">
          {React.cloneElement(child, { size, className: 'ring-2 ring-surface' })}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className={cn(
          "bg-surface-container-high border-2 border-outline-variant flex items-center justify-center font-pixel text-[8px] text-on-surface-variant",
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-10 h-10',
          size === 'lg' && 'w-12 h-12',
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

/**
 * RPGClassIcon - Display an RPG class icon with styling
 */
export const RPGClassIcon = ({ 
  rpgClass = 'default', 
  size = 'md',
  variant = 'default',
  className 
}) => {
  const sizes = {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };
  
  const variants = {
    default: 'text-on-surface-variant',
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
    gold: 'text-tertiary',
  };
  
  const icons = {
    default: 'person',
    warrior: 'swords',
    mage: 'auto_fix_high',
    archer: 'navigation',
    scholar: 'school',
    healer: 'favorite',
    rogue: 'visibility_off',
    paladin: 'shield',
    archmage: 'psychology',
    boss: 'skull',
  };
  
  return (
    <span className={cn(
      "material-symbols-outlined",
      sizes[size],
      variants[variant],
      className
    )}>
      {icons[rpgClass] || icons.default}
    </span>
  );
};

export default Avatar;
