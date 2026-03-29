import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ThemeContext - Manages dark mode and pixel styling preferences
 * Note: This app is dark-mode only, but context is kept for future light mode support
 */
const ThemeContext = createContext({
  isDarkMode: true,
  toggleDarkMode: () => {},
  isPixelMode: true,
  togglePixelMode: () => {},
  animationsEnabled: true,
  toggleAnimations: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Dark mode is always on for this app
  const [isDarkMode] = useState(true);
  
  // Pixel mode is the core aesthetic
  const [isPixelMode, setIsPixelMode] = useState(() => {
    const saved = localStorage.getItem('studyquest-pixel-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Animation preferences
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('studyquest-animations');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  
  // Listen for reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setReducedMotion(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Apply pixel mode class
  useEffect(() => {
    if (isPixelMode) {
      document.documentElement.classList.add('pixel-mode');
    } else {
      document.documentElement.classList.remove('pixel-mode');
    }
    localStorage.setItem('studyquest-pixel-mode', JSON.stringify(isPixelMode));
  }, [isPixelMode]);
  
  // Apply animation preferences
  useEffect(() => {
    if (animationsEnabled && !reducedMotion) {
      document.documentElement.classList.remove('reduce-animations');
    } else {
      document.documentElement.classList.add('reduce-animations');
    }
    localStorage.setItem('studyquest-animations', JSON.stringify(animationsEnabled));
  }, [animationsEnabled, reducedMotion]);
  
  const toggleDarkMode = () => {
    // Dark mode is locked for this app
    console.log('Dark mode is locked for StudyQuest');
  };
  
  const togglePixelMode = () => {
    setIsPixelMode(prev => !prev);
  };
  
  const toggleAnimations = () => {
    setAnimationsEnabled(prev => !prev);
  };
  
  const value = {
    isDarkMode,
    toggleDarkMode,
    isPixelMode,
    togglePixelMode,
    animationsEnabled: animationsEnabled && !reducedMotion,
    toggleAnimations,
    reducedMotion,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
