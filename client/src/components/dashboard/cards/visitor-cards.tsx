import React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SparklinePoint {
  label: string;
  value: number;
}

export interface VisitorCardProps {
  /**
   * Total count to display
   */
  total: number;
  /**
   * Percent change vs prior period
   */
  change?: number;
  /**
   * Label for the comparison period
   */
  periodLabel?: string;
  /**
   * Sparkline data
   */
  sparkline?: SparklinePoint[];
  /**
   * Helper text under the value
   */
  helper?: string;
  /**
   * Optional title override
   */
  title?: string;
  className?: string;
}

const defaultVisitorSparkline: SparklinePoint[] = [
  { label: "Week 1", value: 7200 },
  { label: "Week 2", value: 8300 },
  { label: "Week 3", value: 7900 },
  { label: "Week 4", value: 9100 },
  { label: "Week 5", value: 9800 },
  { label: "Week 6", value: 10400 },
  { label: "Week 7", value: 11250 },
];

const defaultQuarterSparkline: SparklinePoint[] = [
  { label: "Month 1", value: 18200 },
  { label: "Month 2", value: 22100 },
  { label: "Month 3", value: 24750 },
];

function TrendPill({ change, periodLabel }: { change?: number; periodLabel?: string }) {
  if (change === undefined) return null;

  const isPositive = change >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const tint = isPositive
    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    : "text-rose-500 bg-rose-500/10 border-rose-500/20";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        tint,
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2}/>
      <span>{Math.abs(change).toFixed(1)}%</span>
      <span className="text-foreground/60">{periodLabel ?? "vs last period"}</span>
    </div>
  );
}

function Sparkline({ data, color = "#8b5cf6" }: { data: SparklinePoint[]; color?: string }) {
  const gradientId = React.useId();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35}/>
            <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#${gradientId})`}
          strokeWidth={2.5}
          fillOpacity={1}
          isAnimationActive={false}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function VisitorCardFrame({
  title,
  helper,
  total,
  change,
  periodLabel,
  sparkline,
  accent,
  className,
}: VisitorCardProps & { accent: string }) {
  return (
    <Card
      variant="glass"
      padding="lg"
      hover="lift"
      className={cn("relative overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5"/>
      {/* Subtle grid pattern for visual depth */}
      <div className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.08) 1px, transparent 1px), linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}/>
      <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-4 p-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-foreground/70">
            {title}
          </CardTitle>
          {helper ? <CardDescription className="text-xs">{helper}</CardDescription> : null}
        </div>
        <Badge variant="glass" className="border border-border/60">Live</Badge>
      </CardHeader>
      <CardContent className="relative z-10 mt-6 space-y-4 p-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-bold leading-tight tracking-tight">
              {total.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{accent}</p>
          </div>
          <TrendPill change={change} periodLabel={periodLabel}/>
        </div>
        <div className="h-28">
          <Sparkline data={sparkline ?? defaultVisitorSparkline}/>
        </div>
      </CardContent>
    </Card>
  );
}

export function TotalVisitorsCard({
  total,
  change = 4.2,
  periodLabel = "vs last week",
  sparkline = defaultVisitorSparkline,
  helper = "Active unique visitors",
  title = "Total Visitors",
  className,
}: VisitorCardProps) {
  return (
    <VisitorCardFrame
      title={title}
      helper={helper}
      total={total}
      change={change}
      periodLabel={periodLabel}
      sparkline={sparkline}
      accent="Realtime audience overview"
      className={className}/>
  );
}

export function LastQuarterVisitorsCard({
  total,
  change = 9.8,
  periodLabel = "vs prior quarter",
  sparkline = defaultQuarterSparkline,
  helper = "Total visitors for the last 3 months",
  title = "Last 3 Months",
  className,
}: VisitorCardProps) {
  return (
    <VisitorCardFrame
      title={title}
      helper={helper}
      total={total}
      change={change}
      periodLabel={periodLabel}
      sparkline={sparkline}
      accent="Quarterly growth trend"
      className={className}/>
  );
}


