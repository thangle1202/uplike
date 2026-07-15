import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        soft: "0 2px 20px -4px rgb(0 0 0 / 0.08), 0 4px 12px -6px rgb(0 0 0 / 0.04)",
        glow: "0 0 24px -4px hsl(262 83% 58% / 0.35)",
        "inner-soft": "inset 0 1px 2px rgb(0 0 0 / 0.04)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "contact-enter": {
          from: { opacity: "0", transform: "translateX(1.5rem) scale(0.85)" },
          to: { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "contact-header-enter": {
          from: { opacity: "0", transform: "translateY(-10px) scale(0.8)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "contact-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" },
        },
        "contact-ring": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(1.55)", opacity: "0" },
        },
        "contact-ring-sm": {
          "0%": { transform: "scale(1)", opacity: "0.45" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        "phone-shake": {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "5%, 15%": { transform: "rotate(-12deg)" },
          "10%, 20%": { transform: "rotate(12deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out",
        "contact-enter": "contact-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "contact-header-enter": "contact-header-enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "contact-pulse": "contact-pulse 2.5s ease-in-out infinite",
        "contact-ring": "contact-ring 2s ease-out infinite",
        "contact-ring-sm": "contact-ring-sm 2.2s ease-out infinite",
        "phone-shake": "phone-shake 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
