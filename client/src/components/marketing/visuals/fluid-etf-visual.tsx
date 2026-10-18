import React from "react";
import { motion } from "framer-motion";

export function FluidEtfVisual() {
	return (
		<div className="relative w-full h-full flex items-center justify-center overflow-hidden">
			{/* Floating ticker symbols - Very subtle */}
			{[
				{ symbol: "SPY", x: "20%", y: "30%", delay: 0, duration: 15 },
				{ symbol: "QQQ", x: "75%", y: "25%", delay: 0.5, duration: 18 },
				{ symbol: "VOO", x: "30%", y: "65%", delay: 1, duration: 16 },
				{ symbol: "VTI", x: "65%", y: "70%", delay: 1.5, duration: 17 },
			].map((ticker, i) => (
				<motion.div
					key={i}
					className="absolute text-2xl font-light text-primary-500/50"
					initial={{ opacity: 0, y: 20 }}
					animate={{
						opacity: [0, 0.6, 0.6],
						y: [20, 0, -20],
					}}
					transition={{
						opacity: { duration: 2, delay: ticker.delay },
						y: {
							duration: ticker.duration,
							repeat: Infinity,
							repeatType: "reverse",
							ease: "easeInOut",
						},
					}}
					style={{ left: ticker.x, top: ticker.y }}
				>
					{ticker.symbol}
				</motion.div>
			))}

			{/* Subtle grid pattern */}
			<svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 800 600">
				{/* Vertical lines */}
				{[200, 400, 600].map((x, i) => (
					<motion.line
						key={`v-${i}`}
						x1={x}
						y1="100"
						x2={x}
						y2="500"
						stroke="hsl(var(--primary))"
						strokeWidth="0.5"
						strokeDasharray="2 8"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 2, delay: i * 0.2 }}
					/>
				))}

				{/* Horizontal lines */}
				{[200, 300, 400].map((y, i) => (
					<motion.line
						key={`h-${i}`}
						x1="150"
						y1={y}
						x2="650"
						y2={y}
						stroke="hsl(var(--accent))"
						strokeWidth="0.5"
						strokeDasharray="2 8"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 2, delay: 0.3 + i * 0.2 }}
					/>
				))}
			</svg>

			{/* Floating data points */}
			{[...Array(6)].map((_, i) => {
				const angle = (i * 60) * Math.PI / 180;
				const radius = 120;
				return (
					<motion.div
						key={i}
						className="absolute w-2 h-2 rounded-full bg-accent-500/55"
						initial={{
							x: Math.cos(angle) * radius,
							y: Math.sin(angle) * radius,
							opacity: 0,
						}}
						animate={{
							opacity: [0, 0.75, 0.75],
							scale: [0.8, 1.2, 0.8],
						}}
						transition={{
							opacity: { duration: 2, delay: i * 0.3 },
							scale: {
								duration: 3,
								delay: i * 0.3,
								repeat: Infinity,
								ease: "easeInOut",
							},
						}}
					/>
				);
			})}

			{/* Center pulse */}
			<motion.div
				className="absolute w-24 h-24 rounded-full border border-primary-500/45"
				animate={{
					scale: [1, 1.4, 1],
					opacity: [0.55, 0.3, 0.55],
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Minimal overlay text */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.22 }}
				transition={{ duration: 2, delay: 1.5 }}
				className="absolute inset-0 flex items-center justify-center text-[160px] font-extralight text-primary-500/15 select-none"
			>
				ETF
			</motion.div>
		</div>
	);
}
