/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202f",
        paper: "#fbfaf7",
        moss: "#58715a",
        coral: "#d56a54",
        gold: "#c79b3b",
        berry: "#8b4f72",
        lagoon: "#347b8a"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(24, 32, 47, 0.10)"
      }
    }
  },
  plugins: []
};
