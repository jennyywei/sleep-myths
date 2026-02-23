import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dream: {
          purple: "#7c3aed",
          violet: "#8b5cf6",
          indigo: "#4338ca",
          cyan: "#06b6d4",
          pink: "#ec4899",
          gold: "#f59e0b",
        },
      },
      fontFamily: {
        gaegu: ["'Gaegu'", "cursive"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        twinkle: "twinkle 2s ease-in-out infinite",
      },
      backgroundImage: {
        "night-sky":
          "linear-gradient(to bottom, #0a0015 0%, #0d0030 30%, #0a1628 60%, #0d1f3c 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
