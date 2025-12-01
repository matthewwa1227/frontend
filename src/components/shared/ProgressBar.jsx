import React from 'react';

export default function ProgressBar({ 
  current, 
  max, 
  label = '',
  color = 'bg-pixel-success',
  showPercentage = true,
}) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-xs font-pixel text-white">{label}</span>
          {showPercentage && (
            <span className="text-xs font-mono text-gray-400">
              {current} / {max}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-6 bg-pixel-primary border-4 border-pixel-accent">
        <div 
          className={`h-full ${color} transition-all duration-300 border-r-4 border-pixel-dark`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}