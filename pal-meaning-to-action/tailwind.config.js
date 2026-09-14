/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF7F2',
        charcoal: '#16151A',
        violet: '#6C3DF4',
        teal: '#2E8B8B',
        amber: '#D97706',
        red: '#DC2626',
      },
      fontFamily: {
        ui: ['DM Sans', 'system-ui', 'sans-serif'],
        editorial: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        'card': '16px',
        'large': '24px',
      },
    },
  },
  plugins: [],
}
