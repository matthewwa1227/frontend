/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'headline': ['"Space Grotesk"', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'label': ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        // Google Stitch Pixel RPG Color Palette
        'surface': {
          DEFAULT: '#1a063b',
          'dim': '#1a063b',
          'bright': '#412f63',
          'variant': '#3d2b5e',
          'tint': '#ffb1c4',
        },
        'surface-container': {
          DEFAULT: '#271448',
          'low': '#231043',
          'lowest': '#150136',
          'high': '#322053',
          'highest': '#3d2b5e',
        },
        'primary': {
          DEFAULT: '#ffb1c4',
          'fixed': '#ffd9e1',
          'fixed-dim': '#ffb1c4',
          'container': '#ff4a8d',
        },
        'on-primary': {
          DEFAULT: '#65002e',
          'fixed': '#3f001a',
          'fixed-variant': '#8f0044',
          'container': '#590028',
        },
        'secondary': {
          DEFAULT: '#ddfcff',
          'fixed': '#74f5ff',
          'fixed-dim': '#00dbe7',
          'container': '#00f1fe',
        },
        'on-secondary': {
          DEFAULT: '#00363a',
          'fixed': '#002022',
          'fixed-variant': '#004f54',
          'container': '#006a70',
        },
        'tertiary': {
          DEFAULT: '#e9c400',
          'fixed': '#ffe16d',
          'fixed-dim': '#e9c400',
          'container': '#c9a900',
        },
        'on-tertiary': {
          DEFAULT: '#3a3000',
          'fixed': '#221b00',
          'fixed-variant': '#544600',
          'container': '#4c3f00',
        },
        'error': {
          DEFAULT: '#ffb4ab',
          'container': '#93000a',
        },
        'on-error': {
          DEFAULT: '#690005',
          'container': '#ffdad6',
        },
        'background': '#1a063b',
        'on-background': '#ebddff',
        'outline': {
          DEFAULT: '#ac878f',
          'variant': '#5c3f46',
        },
        'inverse': {
          'surface': '#ebddff',
          'on-surface': '#38265a',
          'primary': '#ba005b',
        },
        // Legacy pixel colors for backward compatibility
        'pixel': {
          'bg': '#1a063b',
          'dark': '#271448',
          'primary': '#ff4a8d',
          'accent': '#00f1fe',
          'highlight': '#e9c400',
          'gold': '#e9c400',
          'success': '#00f1fe',
          'warning': '#e9c400',
          'info': '#ddfcff',
          'error': '#ffb4ab',
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px #271448',
        'pixel-sm': '2px 2px 0px 0px #271448',
        'pixel-lg': '8px 8px 0px 0px #271448',
        'pixel-primary': '4px 4px 0px 0px #8f0044',
        'pixel-secondary': '4px 4px 0px 0px #004f54',
        'pixel-tertiary': '4px 4px 0px 0px #4c3f00',
        'pixel-dark': '4px 4px 0px 0px #150136',
        'glow-primary': '0 0 10px rgba(255, 74, 141, 0.4)',
        'glow-secondary': '0 0 10px rgba(0, 241, 254, 0.4)',
        'glow-tertiary': '0 0 10px rgba(233, 196, 0, 0.4)',
      },
      borderRadius: {
        'DEFAULT': '0px',
        'lg': '0px',
        'xl': '0px',
        'full': '9999px',
      },
      animation: {
        'blink': 'blink 1s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'segmented': 'segmented 2s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'pixel-grid': 'radial-gradient(#271448 1px, transparent 1px)',
        'segmented-bar': 'linear-gradient(90deg, transparent 0%, transparent 75%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0.3) 100%)',
      },
      backgroundSize: {
        'pixel-grid': '20px 20px',
        'segmented': '8px 100%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addComponents, addUtilities }) {
      addComponents({
        '.pixel-border': {
          boxShadow: '0 -4px 0 0 #271448, 0 4px 0 0 #271448, -4px 0 0 0 #271448, 4px 0 0 0 #271448',
        },
        '.pixel-border-primary': {
          boxShadow: '0 -4px 0 0 #ff4a8d, 0 4px 0 0 #ff4a8d, -4px 0 0 0 #ff4a8d, 4px 0 0 0 #ff4a8d',
        },
        '.pixel-border-secondary': {
          boxShadow: '0 -4px 0 0 #00f1fe, 0 4px 0 0 #00f1fe, -4px 0 0 0 #00f1fe, 4px 0 0 0 #00f1fe',
        },
        '.pixel-segmented': {
          backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 75%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0.3) 100%)',
          backgroundSize: '8px 100%',
        },
        '.pixel-grid-bg': {
          backgroundImage: 'radial-gradient(#271448 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        },
        '.glass-panel': {
          background: 'rgba(61, 43, 94, 0.6)',
          backdropFilter: 'blur(20px)',
        },
        '.step-easing': {
          transitionTimingFunction: 'steps(4, end)',
        },
      });
      addUtilities({
        '.text-shadow-pixel': {
          textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
        },
        '.image-pixelated': {
          imageRendering: 'pixelated',
        },
        '.scrollbar-pixel': {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1a063b',
            border: '2px solid #271448',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#ff4a8d',
            border: '2px solid #1a063b',
          },
        },
      });
    },
  ],
}
