import React, { useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

/**
 * CombatLog - Right column component showing battle events with timestamps
 * Auto-scrolls to show latest entries
 * 
 * @param {Object} props
 * @param {Array} props.entries - Array of log entries { id, timestamp, text, type }
 * @param {string} props.className - Additional CSS classes
 */
const CombatLog = ({
  entries = [],
  className = '',
}) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  // Get text color based on entry type
  const getEntryStyle = (type) => {
    const styles = {
      system: 'text-on-surface-variant',
      player: 'text-primary',
      boss: 'text-error',
      reward: 'text-tertiary',
      buff: 'text-secondary',
      current: 'text-primary animate-pulse',
    };
    return styles[type] || styles.system;
  };

  // Format timestamp as HH:MM
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toTimeString().slice(0, 5);
  };

  return (
    <div className={cn("bg-surface-container border-2 border-outline-variant shadow-[4px_4px_0px_0px_#150136] h-[400px] flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b-2 border-outline-variant">
        <span className="material-symbols-outlined text-secondary">swords</span>
        <h3 className="font-['Press_Start_2P'] text-[8px] text-secondary">COMBAT LOG</h3>
      </div>

      {/* Scrollable Log Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-pixel"
      >
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">scroll</span>
            <p className="font-body text-xs text-on-surface-variant">
              The battle has not yet begun...
            </p>
            <p className="font-['Press_Start_2P'] text-[8px] text-outline-variant mt-2">
              CAST FOCUS TO START
            </p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div 
              key={entry.id || index}
              className={cn(
                "font-body text-xs leading-relaxed",
                index === entries.length - 1 && entry.type === 'current' && "animate-pulse"
              )}
            >
              {entry.timestamp && (
                <span className="text-tertiary font-mono text-[10px]">
                  [{formatTime(entry.timestamp)}]
                </span>
              )}
              {!entry.timestamp && entry.type === 'current' && (
                <span className="text-tertiary font-mono text-[10px]">
                  [&gt;   ]
                </span>
              )}
              {' '}
              <span className={getEntryStyle(entry.type)}>
                {entry.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer with Current Multiplier */}
      <div className="p-4 border-t-2 border-outline-variant bg-surface-container-high">
        <div className="flex items-center justify-between">
          <span className="font-['Press_Start_2P'] text-[8px] text-on-surface-variant">CURRENT MULTIPLIER</span>
          <span className="font-['Press_Start_2P'] text-sm text-tertiary">1.5x</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Generate initial combat log entries
 */
export const generateInitialLog = () => [
  {
    id: 1,
    timestamp: Date.now(),
    text: 'You enter the Chamber of Focus...',
    type: 'system',
  },
  {
    id: 2,
    timestamp: Date.now(),
    text: 'The Shadow of Doom materializes before you!',
    type: 'boss',
  },
  {
    id: 3,
    timestamp: Date.now(),
    text: 'Prepare for battle! Focus your mind!',
    type: 'system',
  },
];

/**
 * Generate periodic combat events
 */
export const generateCombatEvents = (elapsedMinutes, xpEarned) => {
  const events = [];
  
  // Every 5 minutes: Deep Work bonus
  if (elapsedMinutes > 0 && elapsedMinutes % 5 === 0) {
    events.push({
      id: `deepwork-${elapsedMinutes}`,
      timestamp: Date.now(),
      text: `Deep Work sustained! +${Math.floor(elapsedMinutes / 5) * 10} XP!`,
      type: 'reward',
    });
  }
  
  // Every 15 minutes: Focus streak
  if (elapsedMinutes > 0 && elapsedMinutes % 15 === 0) {
    events.push({
      id: `streak-${elapsedMinutes}`,
      timestamp: Date.now(),
      text: `Focus Streak: ${elapsedMinutes} minutes! Incredible concentration!`,
      type: 'buff',
    });
  }
  
  // Random boss attacks (every 2-5 minutes roughly)
  const attacks = [
    'Shadow uses DISTRACTION! You resisted.',
    'Shadow casts PROCRASTINATION! Your focus holds strong.',
    'Shadow attempts DISCORD! Your mind remains clear.',
    'Shadow fires DOUBT! You deflect with confidence.',
  ];
  
  if (elapsedMinutes > 0 && Math.random() < 0.15) { // 15% chance per minute
    const attack = attacks[Math.floor(Math.random() * attacks.length)];
    events.push({
      id: `attack-${Date.now()}`,
      timestamp: Date.now(),
      text: attack,
      type: 'boss',
    });
  }
  
  return events;
};

export default CombatLog;
