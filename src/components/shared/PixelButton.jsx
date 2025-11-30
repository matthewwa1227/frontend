import React from 'react';

export default function PixelButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = '' 
}) {
  const variants = {
    primary: 'bg-pixel-accent hover:bg-pixel-highlight border-white',
    success: 'bg-green-600 hover:bg-green-500 border-green-300',
    danger: 'bg-red-600 hover:bg-red-500 border-red-300',
    warning: 'bg-yellow-600 hover:bg-yellow-500 border-yellow-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        pixel-btn
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}