/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ Adjust if your files are elsewhere
  ],
  darkMode: "class", // ✅ Important for manual theme toggle
  theme: {
    extend: {},
  },
  plugins: [
     require("tailwind-scrollbar-hide")
  ],
};
