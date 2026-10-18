import React from "react";
import { CreditCard, ShieldCheck, Wifi, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BankingCardProps {
  /**
   * Cardholder or account name
   */
  name: string;
  /**
   * Masked card number (e.g., **** 2390)
   */
  maskedNumber: string;
  /**
   * Current balance text (formatted string)
   */
  balance: string;
  /**
   * Expiry date string (MM/YY)
   */
  expiry: string;
  /**
   * Network/issuer label
   */
  issuer?: string;
  /**
   * Status label (e.g., Active, Frozen)
   */
  status?: string;
  /**
   * Accent theme for the gradient
   */
  accent?: "violet" | "emerald" | "blue" | "amber";
  className?: string;
}

const gradientByAccent: Record<NonNullable<BankingCardProps["accent"]>, string> = {
  violet: "from-[#7c3aed]/80 via-[#4c1d95]/70 to-[#312e81]/80",
  emerald: "from-[#10b981]/70 via-[#0ea5e9]/70 to-[#0f172a]/80",
  blue: "from-[#2563eb]/80 via-[#0ea5e9]/70 to-[#0f172a]/80",
  amber: "from-[#f59e0b]/80 via-[#f97316]/70 to-[#0f172a]/85",
};

export function BankingCard({
  name,
  maskedNumber,
  balance,
  expiry,
  issuer = "Instant Global",
  status = "Active",
  accent = "violet",
  className,
}: BankingCardProps) {
  const gradient = gradientByAccent[accent];

  return (
    <Card
      variant="ambient"
      padding="lg"
      hover="lift"
      className={cn("relative overflow-hidden text-white", className)}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_45%)]"/>
      {/* Subtle grid overlay for depth - FigJam style */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}/>
      <CardContent className="relative z-10 p-0">
        <div className="flex items-start justify-between text-sm">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">{issuer}</p>
            <p className="text-2xl font-semibold leading-tight">{name}</p>
          </div>
          <Badge variant="secondary" className="bg-white/15 text-white border-white/20">
            <div className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5"/>
              <span>{status}</span>
            </div>
          </Badge>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">Balance</p>
            <p className="text-3xl font-bold leading-tight">{balance}</p>
            <p className="text-xs text-white/80">Card ending {maskedNumber}</p>
          </div>
          <div className="flex flex-col items-end gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold">
              <Wifi className="h-4 w-4"/>
              <span>Tap to pay</span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Expiry</p>
                <p className="text-sm font-semibold">{expiry}</p>
              </div>
              <div className="h-10 w-px bg-white/20"/>
              <div className="flex flex-col items-end">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Network</p>
                <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                  <CreditCard className="h-3.5 w-3.5"/>
                  <span>Banking Card</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-white/80">
            <Waves className="h-4 w-4"/>
            <span>Multi-currency ready</span>
          </div>
          <div className="inline-flex gap-3 text-white/70">
            <span className="font-mono tracking-widest">{maskedNumber}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


