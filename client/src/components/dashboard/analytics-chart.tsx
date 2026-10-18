import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ChartData {
  [key: string]: string | number;
}

export interface AnalyticsChartProps {
  /**
   * Chart title
   */
  title: string;
  /**
   * Chart description
   */
  description?: string;
  /**
   * Chart type
   */
  type: "line" | "area" | "bar";
  /**
   * Chart data
   */
  data: ChartData[];
  /**
   * Data key for X axis
   */
  xKey: string;
  /**
   * Data keys for Y axis (supports multiple lines/areas/bars)
   */
  yKeys: {
    key: string;
    label: string;
    color?: string;
  }[];
  /**
   * Height in pixels
   * @default 300
   */
  height?: number;
  /**
   * Show grid
   * @default true
   */
  showGrid?: boolean;
  /**
   * Card variant
   * @default "elevated"
   */
  variant?: "elevated" | "glass" | "default";
  /**
   * Optional actions (e.g., period selector)
   */
  actions?: React.ReactNode;
}

const defaultColors = [
  "#a855f7", // accent-500
  "#22c55e", // primary-500
  "#f59e0b", // yellow-500
  "#3b82f6", // blue-500
  "#ec4899", // pink-500
];

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card shadow-depth-lg p-3">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}/>
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-xs font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function AnalyticsChart({
  title,
  description,
  type,
  data,
  xKey,
  yKeys,
  height = 300,
  showGrid = true,
  variant = "elevated",
  actions,
}: AnalyticsChartProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    const axisProps = {
      stroke: "hsl(var(--muted-foreground))",
      fontSize: 12,
      tickLine: false,
      axisLine: false,
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}/>
            )}
            <XAxis dataKey={xKey} {...axisProps}/>
            <YAxis {...axisProps}/>
            <Tooltip content={<CustomTooltip/>}/>
            {yKeys.map((yKey, index) => (
              <Line
                key={yKey.key}
                type="monotone"
                dataKey={yKey.key}
                name={yKey.label}
                stroke={yKey.color || defaultColors[index % defaultColors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}/>
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}/>
            )}
            <XAxis dataKey={xKey} {...axisProps}/>
            <YAxis {...axisProps}/>
            <Tooltip content={<CustomTooltip/>}/>
            {yKeys.map((yKey, index) => (
              <Area
                key={yKey.key}
                type="monotone"
                dataKey={yKey.key}
                name={yKey.label}
                stroke={yKey.color || defaultColors[index % defaultColors.length]}
                fill={yKey.color || defaultColors[index % defaultColors.length]}
                fillOpacity={0.2}
                strokeWidth={2}/>
            ))}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}/>
            )}
            <XAxis dataKey={xKey} {...axisProps}/>
            <YAxis {...axisProps}/>
            <Tooltip content={<CustomTooltip/>}/>
            {yKeys.map((yKey, index) => (
              <Bar
                key={yKey.key}
                dataKey={yKey.key}
                name={yKey.label}
                fill={yKey.color || defaultColors[index % defaultColors.length]}
                radius={[4, 4, 0, 0]}/>
            ))}
          </BarChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant={variant} padding="lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>

        {/* Legend */}
        {yKeys.length > 1 && (
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border">
            {yKeys.map((yKey, index) => (
              <div key={yKey.key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      yKey.color || defaultColors[index % defaultColors.length],
                  }}/>
                <span className="text-xs text-muted-foreground">
                  {yKey.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/**
 * Compact chart without card wrapper
 */
export function AnalyticsChartCompact({
  type,
  data,
  xKey,
  yKeys,
  height = 200,
}: Pick<AnalyticsChartProps, "type" | "data" | "xKey" | "yKeys" | "height">) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === "line" ? (
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          {yKeys.map((yKey, index) => (
            <Line
              key={yKey.key}
              type="monotone"
              dataKey={yKey.key}
              stroke={yKey.color || defaultColors[index % defaultColors.length]}
              strokeWidth={2}
              dot={false}/>
          ))}
        </LineChart>
      ) : type === "area" ? (
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          {yKeys.map((yKey, index) => (
            <Area
              key={yKey.key}
              type="monotone"
              dataKey={yKey.key}
              stroke={yKey.color || defaultColors[index % defaultColors.length]}
              fill={yKey.color || defaultColors[index % defaultColors.length]}
              fillOpacity={0.3}
              strokeWidth={1.5}/>
          ))}
        </AreaChart>
      ) : (
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          {yKeys.map((yKey, index) => (
            <Bar
              key={yKey.key}
              dataKey={yKey.key}
              fill={yKey.color || defaultColors[index % defaultColors.length]}
              radius={[2, 2, 0, 0]}/>
          ))}
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}


