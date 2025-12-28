// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan semua file di folder src dan App.tsx
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Mapping nama font
        sans: ["Outfit_400Regular"],
        bold: ["Outfit_700Bold"],
        medium: ["Outfit_500Medium"],
      },
      colors: {
        // Jika ada warna custom di web (misal primary blue), tambahkan disini
        // primary: '#1E40AF',
      },
    },
  },
  plugins: [],
};
