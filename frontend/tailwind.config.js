/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#767bff',
        'primary-dark': '#5d5df9',
        'accent': '#ef4444',
        'accent-dark': '#dc2626',
        'neo-yellow': '#fde047',
        'neo-black': '#000000',
      },
      fontFamily: {
        'sans': ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'neo': '4px 4px 0 #000000',
        'neo-lg': '6px 6px 0 #000000',
        'neo-hover': '6px 6px 0 #000000',
      },
    },
  },
  plugins: [],
} 