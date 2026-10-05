import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d13",
        surface: {
          50: "#1e2633",
          100: "#161b22",
          200: "#0f141c",
          300: "#090d13",
          card: "#121820",
          border: "#232b38",
          active: "#2b3545",
        },
        brand: {
          cyan: "#00d2ff",
          indigo: "#3a7bd5",
          accent: "#38bdf8",
        },
      },
      height: {
        dvh: "100dvh",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
export default config;
