/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit_400Regular"],
        bold: ["Outfit_700Bold"],
        medium: ["Outfit_500Medium"],
      },
    },
  },
  plugins: [],
};
