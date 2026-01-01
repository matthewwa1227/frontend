/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'mono': ['monospace'],
      },
      colors: {
        'pixel': {
          'bg': '#0f0f1e',
          'dark': '#1a1a2e',
          'primary': '#16213e',
          'accent': '#0f3460',
          'highlight': '#533483',
          'gold': '#e94560',
          'success': '#00ff88',
          'warning': '#ffaa00',
          'info': '#00aaff',
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0, 0, 0, 0.8)',
        'pixel-sm': '2px 2px 0px 0px rgba(0, 0, 0, 0.8)',
        'pixel-lg': '8px 8px 0px 0px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'blink': 'blink 1s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pixel-spin': 'pixel-spin 2s linear infinite',
        'slide-in-right': 'slide-in-right 0.5s ease-out', // ✅ Added
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
        'pixel-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'slide-in-right': { // ✅ Added
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}