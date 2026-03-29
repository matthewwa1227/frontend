import React from 'react';
import { cn } from '../../utils/cn';

/**
 * ProgressBar - A segmented pixel-art styled progress bar
 * @param {Object} props
 * @param {number} props.value - Current progress value (0-100)
 * @param {number} props.max - Maximum value (default: 100)
 * @param {string} props.variant - 'xp' | 'shadow' | 'health' | 'mana' | 'default'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.segmented - Whether to show segmented pattern
 * @param {boolean} props.showLabel - Whether to show percentage label
 * @param {string} props.label - Custom label text
 * @param {string} props.labelPosition - 'top' | 'inside'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.glow - Whether to add glow effect
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  segmented = true,
  showLabel = false,
  label,
  labelPosition = 'top',
  className = '',
  glow = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const variants = {
    xp: {
      bar: 'bg-gradient-to-r from-secondary to-secondary-container',
      bg: 'bg-surface-container-lowest',
      label: 'text-secondary',
      glow: 'shadow-glow-secondary',
    },
    shadow: {
      bar: 'bg-gradient-to-r from-error to-error-container',
      bg: 'bg-surface-container-lowest',
      label: 'text-error',
      glow: '',
    },
    health: {
      bar: 'bg-gradient-to-r from-error to-primary-container',
      bg: 'bg-surface-container-lowest',
      label: 'text-error',
      glow: '',
    },
    mana: {
      bar: 'bg-gradient-to-r from-secondary to-secondary-container',
      bg: 'bg-surface-container-lowest',
      label: 'text-secondary',
      glow: 'shadow-glow-secondary',
    },
    default: {
      bar: 'bg-primary',
      bg: 'bg-surface-container-lowest',
      label: 'text-on-surface',
      glow: '',
    },
  };
  
  const sizes = {
    sm: {
      container: 'h-2',
      label: 'text-[6px]',
    },
    md: {
      container: 'h-4',
      label: 'text-[8px]',
    },
    lg: {
      container: 'h-6',
      label: 'text-[10px]',
    },
  };
  
  const selectedVariant = variants[variant];
  const selectedSize = sizes[size];
  
  return (
    <div className={cn("w-full", className)}>
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between mb-1">
          <span className={cn("font-pixel", selectedSize.label, selectedVariant.label)}>
            {label || (variant === 'xp' ? 'EXPERIENCE' : variant === 'shadow' ? 'SHADOW OF DOOM' : 'PROGRESS')}
          </span>
          <span className={cn("font-pixel", selectedSize.label, selectedVariant.label)}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={cn(
        "w-full border-2 border-outline-variant overflow-hidden relative",
        selectedSize.container,
        selectedVariant.bg
      )}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out relative",
            selectedVariant.bar,
            segmented && "pixel-segmented",
            glow && selectedVariant.glow
          )}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && labelPosition === 'inside' && percentage > 30 && (
            <span className={cn(
              "absolute inset-0 flex items-center justify-center font-pixel text-on-surface",
              sizes.sm.label
            )}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * MultiSegmentProgressBar - Shows multiple segments for complex stats
 */
export const MultiSegmentProgressBar = ({
  segments = [], // Array of { value, color, label }
  size = 'md',
  className,
  showLegend = false,
}) => {
  const sizes = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };
  
  const colors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    tertiary: 'bg-tertiary',
    error: 'bg-error',
    success: 'bg-secondary-container',
  };
  
  const total = segments.reduce((acc, seg) => acc + (seg.value || 0), 0);
  
  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "w-full flex border-2 border-outline-variant overflow-hidden",
        sizes[size]
      )}>
        {segments.map((segment, idx) => {
          const width = total > 0 ? (segment.value / total) * 100 : 0;
          return (
            <div
              key={idx}
              className={cn(
                "h-full transition-all duration-500",
                colors[segment.color] || segment.color,
                "pixel-segmented"
              )}
              style={{ width: `${width}%` }}
              title={`${segment.label}: ${segment.value}`}
            />
          );
        })}
      </div>
      
      {showLegend && (
        <div className="flex flex-wrap gap-3 mt-2">
          {segments.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <div className={cn("w-2 h-2", colors[segment.color] || segment.color)} />
              <span className="font-pixel text-[6px] text-on-surface-variant">
                {segment.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
