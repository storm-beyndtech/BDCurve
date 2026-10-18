import * as React from "react";
import { motion } from "framer-motion";
import { Globe, MapPin, Users, Building } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GlobalCoverageMapProps {
	className?: string;
	variant?: "default" | "glass" | "minimal";
}

const regions = [
	{
		name: "North America",
		countries: 3,
		position: { left: "15%", top: "25%" },
		color: "primary",
	},
	{
		name: "Europe",
		countries: 32,
		position: { left: "48%", top: "22%" },
		color: "accent",
	},
	{
		name: "Asia Pacific",
		countries: 28,
		position: { left: "75%", top: "40%" },
		color: "primary",
	},
	{
		name: "Latin America",
		countries: 16,
		position: { left: "25%", top: "65%" },
		color: "accent",
	},
	{
		name: "Middle East",
		countries: 10,
		position: { left: "55%", top: "45%" },
		color: "primary",
	},
];

const stats = [
	{
		icon: Globe,
		label: "Countries",
		value: "89",
		description: "Global coverage",
	},
	{
		icon: MapPin,
		label: "Currencies",
		value: "50+",
		description: "Supported",
	},
	{
		icon: Building,
		label: "Trading Assets",
		value: "9,000+",
		description: "Stocks available",
	},
	{
		icon: Users,
		label: "Active Users",
		value: "1M+",
		description: "Investors",
	},
];

export function GlobalCoverageMap({ className, variant = "default" }: GlobalCoverageMapProps) {
	return (
		<section
			className={cn(
				"section-spacing-lg w-full relative overflow-hidden",
				variant === "glass" && "bg-glass-card",
				className,
			)}
		>
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-[0.02]">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
						backgroundSize: "48px 48px",
					}}/>
			</div>

			<div className="container-wide container-padding relative z-10">
				{/* Section Header */}
				<div className="mb-8 md:mb-16 w-full">
					<div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-6">
						<h2 className="text-3xl sm:text-4xl md:text-display-lg font-bold sm:max-w-sm">
							Markets worldwide
						</h2>
						<p className="text-base sm:text-lg md:text-right text-muted-foreground/90 max-w-full md:max-w-[480px] font-medium">
							Serving investors worldwide with access to global markets and multi-asset trading,
							offering stocks, ETFs, options, crypto, and commodities 24/7.
						</p>
					</div>
				</div>

				{/* Map Visualization */}
				<div className="relative w-full mx-auto mb-8 md:mb-16">
					{/* Map Container with Animated Dots */}
					<motion.div
						className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl md:rounded-3xl border border-border/50 overflow-hidden"
						initial={{ opacity: 0, scale: 0.95 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 0.8 }}
					>
						{/* Responsive container with proper aspect ratios */}
						<div className="w-full h-[280px] sm:h-[360px] md:h-auto md:aspect-[18/6]">
						{/* Animated Grid Lines */}
						<div className="absolute inset-0">
							<svg className="w-full h-full opacity-20">
								{/* Horizontal lines */}
								{[...Array(8)].map((_, i) => (
									<motion.line
										key={`h-${i}`}
										x1="0"
										y1={`${(i + 1) * 11.11}%`}
										x2="100%"
										y2={`${(i + 1) * 11.11}%`}
										stroke="currentColor"
										strokeWidth="0.5"
										strokeDasharray="4 4"
										className="text-primary-500/30"
										initial={{ pathLength: 0 }}
										whileInView={{ pathLength: 1 }}
										viewport={{ once: true }}
										transition={{ duration: 1.5, delay: i * 0.1 }}/>
								))}
								{/* Vertical lines */}
								{[...Array(15)].map((_, i) => (
									<motion.line
										key={`v-${i}`}
										x1={`${(i + 1) * 6.25}%`}
										y1="0"
										x2={`${(i + 1) * 6.25}%`}
										y2="100%"
										stroke="currentColor"
										strokeWidth="0.5"
										strokeDasharray="4 4"
										className="text-primary-500/30"
										initial={{ pathLength: 0 }}
										whileInView={{ pathLength: 1 }}
										viewport={{ once: true }}
										transition={{ duration: 1.5, delay: i * 0.1 }}/>
								))}
							</svg>
						</div>

						{/* Region Markers */}
						{regions.map((region, index) => (
							<motion.div
								key={region.name}
								className="absolute"
								style={{
									left: region.position.left,
									top: region.position.top,
									transform: "translate(-50%, -50%)",
								}}
								initial={{ opacity: 0, scale: 0 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: 0.8 + index * 0.15 }}
							>
								{/* Pulsing Circle */}
								<motion.div
									className={cn(
										"relative w-3 h-3 sm:w-4 sm:h-4 rounded-full",
										region.color === "primary" ? "bg-primary-500" : "bg-accent-500",
									)}
									animate={{
										scale: [1, 1.2, 1],
										opacity: [1, 0.7, 1],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										delay: index * 0.3,
									}}
								>
									{/* Ripple Effect */}
									<motion.div
										className={cn(
											"absolute inset-0 rounded-full",
											region.color === "primary" ? "bg-primary-500/30" : "bg-accent-500/30",
										)}
										animate={{
											scale: [1, 2.5],
											opacity: [0.5, 0],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											delay: index * 0.3,
										}}/>
								</motion.div>

								{/* Label - Simplified on mobile */}
								<motion.div
									className="absolute top-5 sm:top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
									initial={{ opacity: 0, y: -10 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
								>
									<div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded px-1.5 py-0.5 sm:rounded-lg sm:px-3 sm:py-1.5 shadow-lg">
										<p className="text-[9px] sm:text-xs font-semibold">{region.name}</p>
										<p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">{region.countries} countries</p>
									</div>
								</motion.div>
							</motion.div>
						))}
						</div>

						{/* Connecting Lines (animated) */}
						<svg className="absolute inset-0 w-full h-full pointer-events-none">
							{regions.slice(0, -1).map((region, index) => {
								const nextRegion = regions[index + 1];
								return (
									<motion.line
										key={`line-${index}`}
										x1={region.position.left}
										y1={region.position.top}
										x2={nextRegion.position.left}
										y2={nextRegion.position.top}
										stroke="currentColor"
										strokeWidth="1"
										strokeDasharray="3 6"
										className="text-primary-500/20"
										initial={{ pathLength: 0 }}
										whileInView={{ pathLength: 1 }}
										viewport={{ once: true }}
										transition={{ duration: 1.5, delay: 1.5 + index * 0.2 }}/>
								);
							})}
						</svg>
					</motion.div>
				</div>

				{/* Stats Grid */}
				<motion.div
					className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.8, delay: 0.3 }}
				>
					{stats.map((stat, index) => (
						<motion.div
							key={stat.label}
							className="flex flex-col items-center text-center p-4 sm:p-5 md:p-6 rounded-xl bg-glass-card border-glass shadow-glass"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
							whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
						>
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-3 sm:mb-4">
								<stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600"/>
							</div>
							<p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
							<p className="text-xs sm:text-sm font-semibold text-foreground/80 mb-1">{stat.label}</p>
							<p className="text-[10px] sm:text-xs text-muted-foreground">{stat.description}</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

/**
 * Compact version for smaller sections
 */
export function GlobalCoverageMapCompact({ className }: { className?: string }) {
	return (
		<section className={cn("py-16 w-full relative", className)}>
			<div className="container-wide container-padding">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{stats.map((stat, index) => (
						<div
							key={stat.label}
							className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30"
						>
							<stat.icon className="h-5 w-5 text-primary-600 mb-2"/>
							<p className="text-2xl font-bold mb-1">{stat.value}</p>
							<p className="text-xs text-muted-foreground">{stat.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}


