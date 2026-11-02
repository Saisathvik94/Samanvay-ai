import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#171717",
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8FAFC",
          sidebar: "#FAFAFA",
          muted: "#F1F5F9",
        },
        border: {
          DEFAULT: "#E5E7EB",
          subtle: "#F1F5F9",
          dark: "#D1D5DB",
        },
        muted: {
          DEFAULT: "#64748B",
          foreground: "#64748B",
          subtle: "#94A3B8",
        },
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          subtle: "#EFF6FF",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#15803D",
          subtle: "#F0FDF4",
          border: "#BBF7D0",
        },
        warning: {
          DEFAULT: "#D97706",
          subtle: "#FFFBEB",
          border: "#FDE68A",
        },
        danger: {
          DEFAULT: "#DC2626",
          subtle: "#FEF2F2",
          border: "#FECACA",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "8px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
