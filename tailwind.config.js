/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif']
      },
      colors: {
        primary: '#1ea7fd',
        accent: '#24d8a6'
      },
      boxShadow: {
        neon: '0 0 20px rgba(36, 216, 166, 0.6)',
        glow: '0 10px 40px rgba(30, 167, 253, 0.35)'
      }
    }
  },
  plugins: []
};
