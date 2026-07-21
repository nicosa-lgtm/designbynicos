/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#050507',
          900: '#0a0a0f',
          800: '#101018',
          700: '#16161f',
          600: '#1d1d28',
          500: '#262633',
        },
        accent: {
          DEFAULT: '#d4ff3f',
          glow: '#b8ff00',
          deep: '#7a9e00',
        },
        cyber: {
          DEFAULT: '#5cf2ff',
          deep: '#0bb9c9',
        },
        steel: {
          DEFAULT: '#9aa3b2',
          dim: '#5b6473',
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(212, 255, 63, 0.45)',
        'glow-cyan': '0 0 40px -10px rgba(92, 242, 255, 0.45)',
        glass: 'inset 0 1px 0 0 rgba(255,255,255,0.08), 0 20px 60px -20px rgba(0,0,0,0.7)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        floatY: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2.4s ease-out infinite',
        floatY: 'floatY 4s ease-in-out infinite',
        scanline: 'scanline 6s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
