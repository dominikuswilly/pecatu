/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pecatu: {
          light: '#008ba3',
          DEFAULT: '#006070',
          dark: '#00424d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Crimson Text', 'serif'], // Closest to the logo's elegant serif
      },
    },
  },
  plugins: [],
}
