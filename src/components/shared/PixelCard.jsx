import React from 'react';

export default function PixelCard({ 
  title, 
  icon, 
  children, 
  className = '',
  headerClassName = '',
}) {
  return (
    <div className={`bg-pixel-dark border-4 border-pixel-accent shadow-pixel ${className}`}>
      {title && (
        <div className={`bg-pixel-accent border-b-4 border-pixel-highlight px-6 py-4 ${headerClassName}`}>
          <h2 className="text-lg font-pixel text-white flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            {title}
          </h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}