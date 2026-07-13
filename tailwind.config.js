/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        rose: {
          DEFAULT: '#C17A5E',
          hover: '#A86548',
          light: '#F5EDE8',
          text: '#8B5E4A',
          glow: '#E8A583',
        },
        page: '#F5F0EB',
        card: '#FFFFFF',
        space: {
          900: '#0A0E27',
          800: '#12173A',
          700: '#1B2150',
        },
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0.2, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(9.5rem) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(9.5rem) rotate(-360deg)' },
        },
        shooting: {
          '0%': { transform: 'translate(0, 0)', opacity: 1 },
          '70%': { opacity: 1 },
          '100%': { transform: 'translate(-22rem, 11rem)', opacity: 0 },
        },
        'card-in': {
          '0%': { opacity: 0, transform: 'translateY(24px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        twinkle: 'twinkle 3.5s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        orbit: 'orbit 14s linear infinite',
        shooting: 'shooting 5.5s ease-in infinite',
        'card-in': 'card-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
