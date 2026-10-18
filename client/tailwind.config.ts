import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Marketing Primary (SaaS Blue)
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",  // Main SaaS blue
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },

        // Dashboard Primary (Emerald)
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",  // Main emerald
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Glass & Depth Colors
        glass: {
          light: "rgba(255, 255, 255, 0.7)",
          "light-border": "rgba(255, 255, 255, 0.2)",
          dark: "rgba(0, 0, 0, 0.5)",
          "dark-border": "rgba(255, 255, 255, 0.1)",
        },

        // Ambient Gradient Colors
        ambient: {
          blue: "#3b82f6",
          emerald: "#10b981",
          cyan: "#06b6d4",
          sky: "#0ea5e9",
          teal: "#14b8a6",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        pill: "9999px",
      },

      spacing: {
        "section-sm": "4rem",
        "section-md": "6rem",
        "section-lg": "8rem",
        "section-xl": "10rem",
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
      },

      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "800" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "700" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "display-sm": ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.005em", fontWeight: "600" }],
      },

      fontWeight: {
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },

      boxShadow: {
        // Apple-style depth shadows (subtle)
        "glass": "0 8px 32px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "depth-sm": "0 2px 8px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03)",
        "depth": "0 4px 16px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.03)",
        "depth-md": "0 8px 24px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.04)",
        "depth-lg": "0 16px 48px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06)",
        "depth-xl": "0 24px 64px rgba(0, 0, 0, 0.1), 0 12px 24px rgba(0, 0, 0, 0.08)",
        "elevated": "0 20px 40px -12px rgba(0, 0, 0, 0.12), 0 8px 16px -8px rgba(0, 0, 0, 0.15)",
        "elevated-lg": "0 32px 64px -12px rgba(0, 0, 0, 0.15), 0 16px 32px -8px rgba(0, 0, 0, 0.18)",
        "ambient-blue": "0 20px 60px -15px rgba(59, 130, 246, 0.3), 0 10px 30px -10px rgba(59, 130, 246, 0.2)",
        "ambient-emerald": "0 20px 60px -15px rgba(16, 185, 129, 0.3), 0 10px 30px -10px rgba(16, 185, 129, 0.2)",
        "ambient-cyan": "0 20px 60px -15px rgba(6, 182, 212, 0.25), 0 10px 30px -10px rgba(6, 182, 212, 0.15)",
      },

      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },

      animation: {
        // Smooth entrance animations
        "fade-in": "fade-in 0.6s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "scale-in": "scale-in 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.6s ease-out",

        // Floating & drift
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "drift": "drift 8s ease-in-out infinite",

        // Marquee
        "marquee": "marquee 35s linear infinite",
        "marquee-reverse": "marquee-reverse 35s linear infinite",
        "marquee-slow": "marquee 45s linear infinite",
        "marquee-fast": "marquee 25s linear infinite",

        // Pulse & glow
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite",

        // Shimmer
        "shimmer": "shimmer 2s linear infinite",

        // Accordion
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },

      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "drift": {
          "0%, 100%": { transform: "translateX(0px) translateY(0px)" },
          "33%": { transform: "translateX(20px) translateY(-10px)" },
          "66%": { transform: "translateX(-20px) translateY(10px)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "ambient-gradient": "radial-gradient(circle at 20% 50%, var(--tw-gradient-stops))",
        "ambient-mesh": "radial-gradient(at 40% 20%, hsla(280, 100%, 70%, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(240, 100%, 70%, 0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(320, 100%, 70%, 0.3) 0px, transparent 50%)",
        "shimmer": "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
      },

      typography: {
        DEFAULT: {
          css: {
            maxWidth: "65ch",
            color: "hsl(var(--foreground))",
            a: {
              color: "hsl(var(--primary))",
              "&:hover": {
                color: "hsl(var(--primary) / 0.8)",
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
