import React from 'react';
import { cn } from '../../utils/cn';
import HeroHUD from './HeroHUD';

/**
 * BossArena - Center column component with boss visual, timer, and battle commands
 * 
 * @param {Object} props
 * @param {string} props.formattedTime - Current timer display (MM:SS)
 * @param {number} props.timeRemaining - Seconds remaining
 * @param {number} props.bossHPPercent - Boss HP percentage (0-100)
 * @param {number} props.stamina - Hero stamina (0-100)
 * @param {number} props.focus - Hero focus (0-100)
 * @param {number} props.level - Hero level
 * @param {string} props.status - Current session status (IDLE, FOCUSING, PAUSED, etc.)
 * @param {function} props.onStart - Start session handler
 * @param {function} props.onPause - Pause session handler
 * @param {function} props.onFlee - Flee session handler
 * @param {string} props.className - Additional CSS classes
 */
const BossArena = ({
  formattedTime = '25:00',
  timeRemaining = 1500,
  bossHPPercent = 72,
  stamina = 100,
  focus = 0,
  level = 42,
  status = 'IDLE',
  onStart,
  onPause,
  onFlee,
  className = '',
}) => {
  // Determine timer color based on time remaining
  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  const timerColor = isLowTime ? 'text-error' : 'text-primary';
  const timerGlow = isLowTime 
    ? 'drop-shadow-[0_0_8px_rgba(255,180,171,0.6)]' 
    : 'drop-shadow-[0_0_8px_rgba(255,177,196,0.6)]';

  // Get button states based on status
  const isIdle = status === 'IDLE';
  const isFocusing = status === 'FOCUSING';
  const isPaused = status === 'PAUSED';

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hero HUD */}
      <HeroHUD 
        stamina={stamina} 
        focus={focus} 
        level={level} 
      />

      {/* Boss Arena */}
      <div className="relative aspect-video bg-surface-container-highest border-2 border-outline-variant overflow-hidden">
        {/* Background Pattern - Dark Gothic Cathedral Effect */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 50% 0%, #3d2b5e 0%, transparent 50%),
                radial-gradient(ellipse at 20% 80%, #271448 0%, transparent 40%),
                radial-gradient(ellipse at 80% 80%, #271448 0%, transparent 40%)
              `
            }}
          />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-pixel-grid-bg opacity-30" />
        </div>

        {/* Vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background opacity-60" />

        {/* Boss HP Bar - Top Center */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 z-10">
          <div className="text-center mb-2">
            <span className="font-['Press_Start_2P'] text-[8px] text-primary">SHADOW OF DOOM</span>
          </div>
          <div className="h-2 bg-black border border-outline-variant overflow-hidden">
            <div 
              className="h-full bg-primary shadow-[0_0_10px_#ff4a8d] transition-all duration-1000"
              style={{ width: `${bossHPPercent}%` }}
            />
          </div>
          <div className="text-center mt-1">
            <span className="font-['Press_Start_2P'] text-[6px] text-primary">{bossHPPercent}/100 HP</span>
          </div>
        </div>

        {/* Boss Visual - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Boss glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-full blur-3xl transition-opacity duration-1000",
              bossHPPercent > 50 ? "bg-primary/30 opacity-100" : "bg-error/30 opacity-70"
            )} />
            
            {/* Boss Icon/Avatar */}
            <div className={cn(
              "w-48 h-48 flex items-center justify-center transition-transform duration-500",
              isFocusing && "animate-pulse scale-105"
            )}>
              <span className={cn(
                "material-symbols-outlined text-[180px] transition-colors duration-1000",
                bossHPPercent > 50 ? "text-primary" : "text-error"
              )} style={{fontVariationSettings: "'FILL' 1"}}>
                skull
              </span>
            </div>

            {/* Boss status text */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className={cn(
                "font-['Press_Start_2P'] text-[10px]",
                bossHPPercent > 50 ? "text-primary" : "text-error animate-pulse"
              )}>
                {bossHPPercent > 50 ? "THE SHADOW GROWS WEAK..." : "CRITICAL! PUSH ON!"}
              </span>
            </div>
          </div>
        </div>

        {/* Timer Display - Bottom Center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 max-w-sm">
          <div className={cn(
            "glass-panel border-2 border-primary/40 p-4",
            "shadow-[4px_4px_0_0_rgba(255,74,141,0.2)]"
          )}>
            {/* Label */}
            <div className="text-center mb-2">
              <span className="font-['Press_Start_2P'] text-[8px] text-secondary/70">
                BATTLE TIME REMAINING
              </span>
            </div>
            
            {/* Timer */}
            <div className={cn(
              "text-center font-['Press_Start_2P'] text-4xl tracking-tighter",
              timerColor,
              timerGlow,
              isLowTime && "animate-pulse"
            )}>
              {formattedTime}
            </div>

            {/* Status indicator */}
            <div className="text-center mt-2">
              <span className={cn(
                "font-['Press_Start_2P'] text-[8px] uppercase",
                isFocusing ? "text-secondary animate-pulse" : "text-on-surface-variant"
              )}>
                {isFocusing ? "⚔️ BATTLE IN PROGRESS ⚔️" : 
                 isPaused ? "⏸️ BATTLE PAUSED" : 
                 "⚡ READY TO ENGAGE ⚡"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Commands */}
      <div className="grid grid-cols-3 gap-4">
        {/* CAST FOCUS / RESUME */}
        <button
          onClick={onStart}
          disabled={isFocusing}
          className={cn(
            "py-4 font-['Press_Start_2P'] text-[10px] uppercase",
            "border-b-8 active:translate-y-2 active:border-b-0 transition-all",
            isFocusing
              ? "bg-surface-container text-on-surface-variant border-surface-container-highest cursor-not-allowed"
              : "bg-primary-container text-white border-on-primary-fixed-variant hover:brightness-110"
          )}
        >
          <span className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined">
              {isPaused ? 'play_arrow' : 'flare'}
            </span>
            {isIdle ? 'CAST FOCUS' : isPaused ? 'RESUME' : 'FOCUSING...'}
          </span>
        </button>

        {/* REST / PAUSE */}
        <button
          onClick={onPause}
          disabled={!isFocusing}
          className={cn(
            "py-4 font-['Press_Start_2P'] text-[10px] uppercase",
            "border-b-8 active:translate-y-2 active:border-b-0 transition-all",
            isFocusing
              ? "bg-surface-container text-secondary border-surface-container-highest hover:bg-surface-container-high"
              : "bg-surface-container-low text-on-surface-variant border-surface cursor-not-allowed"
          )}
        >
          <span className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined">coffee</span>
            REST
          </span>
        </button>

        {/* FLEE */}
        <button
          onClick={onFlee}
          disabled={isIdle}
          className={cn(
            "py-4 font-['Press_Start_2P'] text-[10px] uppercase",
            "border-b-8 active:translate-y-2 active:border-b-0 transition-all",
            isIdle
              ? "bg-surface-container-low text-on-surface-variant/50 border-surface cursor-not-allowed"
              : "bg-surface-container-low text-error border-surface opacity-80 hover:opacity-100"
          )}
        >
          <span className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined">directions_run</span>
            FLEE
          </span>
        </button>
      </div>
    </div>
  );
};

export default BossArena;
