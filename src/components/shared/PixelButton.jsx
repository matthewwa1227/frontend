import React from 'react';

export default function PixelButton({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  disabled = false,
  className = '',
  ...props 
}) {
  const baseClasses = "px-6 py-3 font-pixel text-xs uppercase tracking-wider border-4 shadow-pixel transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "border-white bg-pixel-accent text-white hover:bg-pixel-highlight hover:shadow-pixel-sm hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-2 active:translate-y-2",
    success: "border-white bg-green-700 text-white hover:bg-green-600 hover:shadow-pixel-sm hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-2 active:translate-y-2",
    danger: "border-white bg-red-700 text-white hover:bg-red-600 hover:shadow-pixel-sm hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-2 active:translate-y-2",
    gold: "border-white bg-pixel-gold text-white hover:bg-yellow-600 hover:shadow-pixel-sm hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-2 active:translate-y-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}