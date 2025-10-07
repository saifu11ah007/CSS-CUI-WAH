/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/page/**/*.{js,jsx,ts,tsx}", // Scan pages in src/page
    "./src/**/*.{js,jsx,ts,tsx}" // Include other files in src (e.g., App.js)
  ],
  theme: {
    extend: {}, // Add custom themes if needed
  },
  plugins: [],
};