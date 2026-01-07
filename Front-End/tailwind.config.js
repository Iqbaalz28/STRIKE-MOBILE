/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				outfit: ["Outfit_400Regular"],
				"outfit-medium": ["Outfit_500Medium"],
				"outfit-bold": ["Outfit_700Bold"],
			},
		},
	},
	plugins: [],
};
