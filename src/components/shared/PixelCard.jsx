import React from 'react';

export default function PixelCard({ 
  title, 
  children, 
  icon,
  className = '' 
}) {
  return (
    <div className={`pixel-card ${className}`}>
      {title && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b-4 border-pixel-accent">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-sm font-pixel text-pixel-gold uppercase">
            {title}
          </h2>
        </div>
      )}
      {children}
    </div>
  );
}