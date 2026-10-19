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
      <span className="absolute -inset-x-1 top-0 h-[62%] overflow-hidden" aria-hidden="true">
        <img src="/logo2.png" alt="" width={2048} height={768} className="absolute inset-x-0 top-0 h-auto w-full" />
      </span>
      <span
        className={cn("relative bottom-2 whitespace-nowrap text-left font-normal leading-none tracking-[-0.02em] text-foreground", preset.text)}
        style={{ fontFamily: 'Bahnschrift, "Aptos Display", "Avenir Next", sans-serif' }}
      >
        BD<span className="text-primary-600">-</span>Curve
      </span>
    </span>
  );
}
