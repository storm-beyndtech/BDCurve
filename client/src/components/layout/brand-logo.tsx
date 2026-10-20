import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

const sizePresets = {
  sm: { frame: "h-12", text: "text-[18px]" },
  default: { frame: "h-14", text: "text-xl" },
  lg: { frame: "h-16", text: "text-2xl" },
};

export function BrandLogo({ size = "sm", className }: BrandLogoProps) {
  const preset = sizePresets[size];

  return (
    <span className={cn("relative inline-flex shrink-0 items-end", preset.frame, className)} aria-label="BD-Curve">
      {/* Curve-only artwork (the old logo2.png also contained the "BD-Curve" wordmark, which peeked through behind the text). */}
      <img src="/logo-curve.png" alt="" aria-hidden="true" width={800} height={147} className="pointer-events-none absolute -inset-x-1 top-1 h-auto w-[calc(100%+0.5rem)] select-none" />
      <span
        className={cn("relative bottom-2 whitespace-nowrap text-left font-normal leading-none tracking-[-0.02em] text-foreground", preset.text)}
        style={{ fontFamily: 'Bahnschrift, "Aptos Display", "Avenir Next", sans-serif' }}
      >
        BD<span className="text-primary-600">-</span>Curve
      </span>
    </span>
  );
}
