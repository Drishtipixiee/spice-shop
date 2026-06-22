/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FFF8F0',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        spice: {
          50: '#FEF3E2',
          100: '#FDE4BC',
          200: '#FBC882',
          300: '#F9A848',
          400: '#F78E2E',
          500: '#FF6B35',
          600: '#E85D2A',
          700: '#C44D21',
          800: '#A03D18',
          900: '#7C2D10',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-slide-up': 'fade-slide-up 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
