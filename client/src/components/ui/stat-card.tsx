import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
	/**
	 * Icon component
	 */
	icon: LucideIcon;
	/**
	 * Stat label
	 */
	label: string;
	/**
	 * Stat value (e.g., "89", "50+", "10K+")
	 */
	value: string;
	/**
	 * Optional description
	 */
	description?: string;
	/**
	 * Additional className
	 */
	className?: string;
}

/**
 * Ideal stat card component with "tiny lil color" tint
 * This is the reference design for all metric displays
 */
export function StatCard({ icon: Icon, label, value, className }: StatCardProps) {
	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-xl sm:p-6 p-4",
				"bg-glass-card border-glass shadow-glass backdrop-blur-xl",
				"hover:scale-105 transition-transform duration-300",
				"flex flex-col items-center text-center",
				className,
			)}
		>
			{/* Subtle tint background */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-60"/>

			{/* Premium grid pattern - FigJam style */}
			<div className="absolute inset-0 opacity-[0.12]"
				style={{
					backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.15) 1px, transparent 1px), linear-gradient(to right, rgba(34, 197, 94, 0.15) 1px, transparent 1px)',
					backgroundSize: '32px 32px'
				}}/>

			{/* Content */}
			<div className="w-full relative z-10 flex items-center sm:gap-8 gap-4">
				{/* Icon */}
				<div className="inline-flex items-center justify-center sm:w-18 sm:h-18 flex-shrink-0 rounded-xl bg-primary-500/5">
					<Icon className="h-4 sm:h-6 w-4 sm:w-6 text-primary-500 dark:text-primary-400" strokeWidth={1}/>
				</div>
				<div className="text-left">
					{/* Value */}
					<p className="text-3xl font-bold tracking-tight">{value}</p>

					{/* Label */}
					<p className="!text-xs !sm:text-sm font-semibold text-foreground/60">{label}</p>
				</div>
			</div>

			{/* Hover glow effect */}
			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/5 pointer-events-none"/>
		</div>
	);
}


