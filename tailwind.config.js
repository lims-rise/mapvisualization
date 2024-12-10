/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#0FB3BA",
        orange: "#FF6347",
        blue: "#006BFF",
        pink: "#FF067F",
        active: "#92D050",
        underconstruction: "#BFBFBF",
        demolished: "#FF5050",
        vacant: "#FFD966",

      },
    },
  },
  plugins: [],
};
