import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}","./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        purple: { DEFAULT: '#7C3AED', light: '#EDE9FE', mid: '#A78BFA', dark: '#6D28D9' },
        gold: { DEFAULT: '#F59E0B', light: '#FEF3C7' },
        luck: '#22C55E', wealth: '#F59E0B', love: '#EC4899', career: '#3B82F6', energy: '#8B5CF6',
        surface: '#FFFFFF', bg: '#F8F7FF', text: { DEFAULT: '#1E1B4B', 2: '#6B7280', 3: '#9CA3AF' },
      },
      fontFamily: { sans: ['Noto Sans Thai', 'Sarabun', 'Inter', 'sans-serif'] },
      borderRadius: { xl: '16px', '2xl': '20px', '3xl': '24px' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(124,58,237,0.12)',
        purple: '0 4px 15px rgba(124,58,237,0.35)',
      },
    },
  },
  plugins: [],
};
export default config;
