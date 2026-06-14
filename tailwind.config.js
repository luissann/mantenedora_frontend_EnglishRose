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
        },
        page: '#F5F0EB',
        card: '#FFFFFF',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
