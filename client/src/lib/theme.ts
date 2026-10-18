/**
 * Central Theme Tokens for Bounding Curve
 * Apple-style glass effects, depth shadows, and ambient gradients
 */

// Glass Effect Tokens (Apple-style liquid glass)
export const glass = {
  light: {
    background: "rgba(255, 255, 255, 0.7)",
    backgroundHover: "rgba(255, 255, 255, 0.8)",
    border: "rgba(255, 255, 255, 0.2)",
    borderHover: "rgba(255, 255, 255, 0.3)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    blur: "blur(16px)",
  },
  dark: {
    background: "rgba(0, 0, 0, 0.5)",
    backgroundHover: "rgba(0, 0, 0, 0.6)",
    border: "rgba(255, 255, 255, 0.1)",
    borderHover: "rgba(255, 255, 255, 0.15)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    blur: "blur(16px)",
  },
  nav: {
    light: "rgba(255, 255, 255, 0.75)",
    dark: "rgba(10, 10, 10, 0.7)",
    blur: "blur(20px)",
  },
  card: {
    light: "rgba(255, 255, 255, 0.6)",
    dark: "rgba(20, 20, 20, 0.6)",
    blur: "blur(12px)",
  },
} as const;

// Depth Shadow Tokens (Apple-style elevation)
export const depth = {
  none: "none",
  sm: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
  base: "0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)",
  md: "0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)",
  lg: "0 16px 48px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.12)",
  xl: "0 24px 64px rgba(0, 0, 0, 0.2), 0 12px 24px rgba(0, 0, 0, 0.16)",
  elevated: "0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.3)",
  elevatedLg: "0 32px 64px -12px rgba(0, 0, 0, 0.3), 0 16px 32px -8px rgba(0, 0, 0, 0.35)",
} as const;

// Ambient Gradient Tokens (Background meshes & glows)
export const ambient = {
  // Marketing page gradients (green-based)
  marketing: {
    hero: "radial-gradient(at 40% 20%, rgba(34, 197, 94, 0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(5, 150, 105, 0.1) 0px, transparent 50%)",
    section: "radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 70%)",
    cta: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
  },

  // Dashboard gradients (purple-based)
  dashboard: {
    background: "radial-gradient(at 40% 20%, rgba(168, 85, 247, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(147, 51, 234, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(126, 34, 206, 0.08) 0px, transparent 50%)",
    panel: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, transparent 100%)",
    accent: "radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.2) 0%, transparent 60%)",
  },

  // Color-specific glows
  glow: {
    purple: "0 20px 60px -15px rgba(168, 85, 247, 0.4)",
    green: "0 20px 60px -15px rgba(34, 197, 94, 0.4)",
    blue: "0 20px 60px -15px rgba(59, 130, 246, 0.4)",
    pink: "0 20px 60px -15px rgba(236, 72, 153, 0.4)",
  },
} as const;

// Border Radius Tokens (Apple-style rounded corners)
export const radius = {
  none: "0",
  sm: "0.25rem",
  base: "0.5rem",
  md: "0.625rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  pill: "9999px",
  card: "1.25rem",
  button: "0.75rem",
} as const;

// Spacing Tokens (Section padding)
export const spacing = {
  section: {
    sm: "4rem",
    md: "6rem",
    lg: "8rem",
    xl: "10rem",
  },
  container: {
    padding: "1.5rem",
    maxWidth: "1280px",
  },
} as const;

// Animation Duration Tokens
export const animation = {
  duration: {
    fast: "150ms",
    base: "300ms",
    slow: "600ms",
    slower: "900ms",
  },
  ease: {
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    snappy: "cubic-bezier(0.4, 0, 0.6, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
  marquee: {
    slow: "45s",
    base: "35s",
    fast: "25s",
  },
} as const;

// Marketing CTA Styles (Green-based, elevated glass)
export const marketingCTA = {
  primary: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    hover: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    shadow: "0 8px 24px -6px rgba(34, 197, 94, 0.5), 0 4px 12px -3px rgba(34, 197, 94, 0.3)",
    hoverShadow: "0 12px 32px -8px rgba(34, 197, 94, 0.6), 0 6px 16px -4px rgba(34, 197, 94, 0.4)",
  },
  glass: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "rgba(255, 255, 255, 0.2)",
    hover: "rgba(255, 255, 255, 0.15)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
} as const;

// Dashboard CTA Styles (Purple-based, subtle)
export const dashboardCTA = {
  primary: {
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
    hover: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)",
    shadow: "0 4px 16px -4px rgba(168, 85, 247, 0.4)",
    hoverShadow: "0 8px 24px -6px rgba(168, 85, 247, 0.5)",
  },
  subtle: {
    background: "rgba(168, 85, 247, 0.1)",
    hover: "rgba(168, 85, 247, 0.15)",
    border: "rgba(168, 85, 247, 0.2)",
  },
} as const;

// Typography Scale (Display sizes)
export const typography = {
  display: {
    "2xl": {
      fontSize: "4.5rem",
      lineHeight: "1.1",
      letterSpacing: "-0.02em",
    },
    xl: {
      fontSize: "3.75rem",
      lineHeight: "1.1",
      letterSpacing: "-0.02em",
    },
    lg: {
      fontSize: "3rem",
      lineHeight: "1.2",
      letterSpacing: "-0.01em",
    },
    md: {
      fontSize: "2.25rem",
      lineHeight: "1.2",
      letterSpacing: "-0.01em",
    },
    sm: {
      fontSize: "1.875rem",
      lineHeight: "1.3",
      letterSpacing: "0",
    },
  },
} as const;

// Export combined theme object
export const theme = {
  glass,
  depth,
  ambient,
  radius,
  spacing,
  animation,
  marketingCTA,
  dashboardCTA,
  typography,
} as const;

export type Theme = typeof theme;
