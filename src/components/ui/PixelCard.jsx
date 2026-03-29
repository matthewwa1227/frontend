import React from 'react';
import { cn } from '../../utils/cn';

/**
 * PixelCard - A retro pixel-art styled card component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - 'default' | 'primary' | 'secondary' | 'tertiary' | 'glass'
 * @param {string} props.borderPosition - 'all' | 'left' | 'right' | 'top' | 'bottom'
 * @param {boolean} props.shadow - Whether to show pixel shadow
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.header - Optional header content
 * @param {React.ReactNode} props.footer - Optional footer content
 * @param {function} props.onClick - Optional click handler
 */
const PixelCard = ({
  children,
  variant = 'default',
  borderPosition = 'all',
  shadow = true,
  className = '',
  header,
  footer,
  onClick,
  ...props
}) => {
  const baseStyles = 'relative overflow-hidden';
  
  const variants = {
    default: 'bg-surface-container border-2 border-outline-variant',
    primary: 'bg-surface-container border-l-4 border-primary',
    secondary: 'bg-surface-container border-l-4 border-secondary',
    tertiary: 'bg-surface-container border-l-4 border-tertiary',
    glass: 'glass-panel border border-outline-variant/50',
    elevated: 'bg-surface-container-high border-2 border-outline-variant',
    dark: 'bg-surface-container-low border-2 border-surface-container-highest',
  };
  
  const borderStyles = {
    all: '',
    left: 'border-l-4 border-r-0 border-t-0 border-b-0',
    right: 'border-r-4 border-l-0 border-t-0 border-b-0',
    top: 'border-t-4 border-l-0 border-r-0 border-b-0',
    bottom: 'border-b-4 border-l-0 border-r-0 border-t-0',
  };
  
  const shadowStyles = shadow ? 'shadow-pixel' : '';
  const clickableStyles = onClick ? 'cursor-pointer hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform' : '';
  
  return (
    <div
      onClick={onClick}
      className={cn(
        baseStyles,
        variants[variant],
        borderStyles[borderPosition],
        shadowStyles,
        clickableStyles,
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-4 py-3 border-b-2 border-outline-variant/30 bg-surface-container-high/50">
          {header}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t-2 border-outline-variant/30 bg-surface-container-high/50">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * PixelCardHeader - Pre-styled header for PixelCard
 */
export const PixelCardHeader = ({ children, className, icon, action }) => (
  <div className={cn("flex items-center justify-between", className)}>
    <div className="flex items-center gap-3">
      {icon && <span className="text-primary">{icon}</span>}
      <h3 className="font-pixel text-[10px] text-on-surface uppercase tracking-tight">{children}</h3>
    </div>
    {action && <div>{action}</div>}
  </div>
);

/**
 * PixelCardTitle - Large title for PixelCard
 */
export const PixelCardTitle = ({ children, className, color = 'primary' }) => {
  const colors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
    default: 'text-on-surface',
  };
  
  return (
    <h2 className={cn("font-headline text-xl font-black tracking-tight uppercase", colors[color], className)}>
      {children}
    </h2>
  );
};

/**
 * PixelCardContent - Content wrapper for consistent spacing
 */
export const PixelCardContent = ({ children, className }) => (
  <div className={cn("space-y-4", className)}>
    {children}
  </div>
);

export default PixelCard;
