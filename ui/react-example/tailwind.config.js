/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ['selector', '[data-mantine-color-scheme="dark"]'],
  theme: {
    extend: {},
  },
  plugins: [],
};
