import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

const sizePresets = {
  sm: { mark: "h-8 w-8", text: "text-lg" },
  default: { mark: "h-9 w-9", text: "text-xl" },
  lg: { mark: "h-11 w-11", text: "text-2xl" },
};

export function BrandLogo({ size = "sm", className }: BrandLogoProps) {
  const preset = sizePresets[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label="BDCurve">
      <span className={cn("relative flex items-center justify-center rounded-xl bg-foreground text-background", preset.mark)} aria-hidden="true">
        <span className="text-sm font-black tracking-[-0.16em]">BD</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary-600" />
      </span>
      <span className={cn("font-semibold tracking-[-0.035em] text-foreground", preset.text)}>BDCurve</span>
    </span>
  );
}
