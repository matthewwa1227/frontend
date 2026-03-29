import React from 'react';
import { cn } from '../../utils/cn';

/**
 * PixelButton - A retro pixel-art styled button component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {function} props.onClick - Click handler
 * @param {string} props.variant - 'primary' | 'secondary' | 'tertiary' | 'ghost'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.fullWidth - Whether button takes full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {string} props.iconPosition - 'left' | 'right'
 */
const PixelButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles = 'font-pixel uppercase tracking-wider transition-all duration-75 step-easing flex items-center justify-center gap-2 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0';
  
  const variants = {
    primary: 'bg-primary-container text-on-primary shadow-pixel-primary border-b-4 border-on-primary-fixed-variant hover:brightness-110',
    secondary: 'bg-secondary-container text-on-secondary shadow-pixel-secondary border-b-4 border-on-secondary-fixed-variant hover:brightness-110',
    tertiary: 'bg-tertiary text-on-tertiary shadow-pixel-tertiary border-b-4 border-on-tertiary-fixed-variant hover:brightness-110',
    ghost: 'bg-surface-container text-secondary border-2 border-outline-variant hover:border-primary hover:text-primary',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-on-primary',
  };
  
  const sizes = {
    sm: 'text-[8px] px-3 py-2',
    md: 'text-[10px] px-4 py-3',
    lg: 'text-xs px-6 py-4',
    xl: 'text-sm px-8 py-5',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        widthClass,
        className
      )}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span className="truncate">{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
};

export default PixelButton;
