import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  /**
   * Logo size preset
   * @default "default"
   */
  size?: "sm" | "default" | "lg";
  /**
   * Additional className
   */
  className?: string;
}

const sizePresets = {
  sm: { width: 120, height: 30, className: "h-5" },
  default: { width: 160, height: 40, className: "h-7" },
  lg: { width: 200, height: 50, className: "h-10" },
};

export function BrandLogo({ size = "sm", className }: BrandLogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(sizePresets[size].className, "w-auto", className)}
        style={{ minWidth: sizePresets[size].width }}
      />
    );
  }

  // Use darker logo (logo2.png) for light mode, lighter logo (logo.png) for dark mode
  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === "dark" ? "/logo.png" : "/logo2.png";

  return (
    <img
      src={logoSrc}
      alt="Bounding Curve"
      width={sizePresets[size].width}
      height={sizePresets[size].height}
      className={cn(sizePresets[size].className, "w-auto", className)}
    />
  );
}

