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
        void: "#0A0618",
        indigo: {
          deep: "#1A0F3C",
          mid: "#2D1B69",
        },
        mystic: "#7B2FBE",
        oracle: {
          gold: "#C9A84C",
          light: "#E8D5A3",
        },
        aura: {
          wanderer: "#6B7280",
          seeker: "#3B82F6",
          mystic: "#8B5CF6",
          oracle: "#F59E0B",
          celestial: "#EC4899",
        },
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(123, 47, 190, 0.4)" },
          "100%": { boxShadow: "0 0 40px rgba(123, 47, 190, 0.8), 0 0 80px rgba(201, 168, 76, 0.3)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      backgroundImage: {
        "mystic-gradient": "linear-gradient(135deg, #0A0618 0%, #1A0F3C 50%, #0A0618 100%)",
        "gold-shimmer": "linear-gradient(90deg, transparent 0%, #C9A84C 50%, transparent 100%)",
        "aura-radial": "radial-gradient(ellipse at center, rgba(123,47,190,0.3) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};
export default config;
