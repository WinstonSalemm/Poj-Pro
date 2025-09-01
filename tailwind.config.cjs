/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: "#660000",
        // use built-in gray (neutral) as accent if needed via utilities
      },
    },
  },
  plugins: []
}
