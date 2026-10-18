import React from "react";
import { motion } from "framer-motion";

export function TradingChartVisual() {
	return (
		<div className="relative w-full h-[400px] flex items-center justify-center">
			{/* Background Glow */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 rounded-2xl" />

			{/* Chart Container */}
			<div className="relative w-full max-w-2xl h-full flex items-end justify-between gap-2 px-8 pb-12">
				{/* Candlestick Chart Bars */}
				{[
					{ height: 45, color: "green", delay: 0.1 },
					{ height: 60, color: "green", delay: 0.2 },
					{ height: 35, color: "red", delay: 0.3 },
					{ height: 55, color: "green", delay: 0.4 },
					{ height: 70, color: "green", delay: 0.5 },
					{ height: 50, color: "red", delay: 0.6 },
					{ height: 65, color: "green", delay: 0.7 },
					{ height: 80, color: "green", delay: 0.8 },
					{ height: 55, color: "red", delay: 0.9 },
					{ height: 75, color: "green", delay: 1.0 },
					{ height: 85, color: "green", delay: 1.1 },
					{ height: 70, color: "green", delay: 1.2 },
				].map((bar, index) => (
					<motion.div
						key={index}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: `${bar.height}%`, opacity: 1 }}
						transition={{
							duration: 0.8,
							delay: bar.delay,
							ease: "easeOut",
						}}
						className={`w-full flex flex-col justify-end items-center gap-1`}
					>
						{/* Wick */}
						<motion.div
							className={`w-0.5 ${bar.color === "green" ? "bg-green-500/40" : "bg-red-500/40"}`}
							style={{ height: "20%" }}
						/>
						{/* Candle Body */}
						<motion.div
							className={`w-full rounded ${
								bar.color === "green"
									? "bg-gradient-to-b from-green-500 to-green-600 shadow-lg shadow-green-500/30"
									: "bg-gradient-to-b from-red-500 to-red-600 shadow-lg shadow-red-500/30"
							}`}
							style={{ height: "60%" }}
							whileHover={{ scale: 1.05 }}
						/>
						{/* Bottom Wick */}
						<motion.div
							className={`w-0.5 ${bar.color === "green" ? "bg-green-500/40" : "bg-red-500/40"}`}
							style={{ height: "20%" }}
						/>
					</motion.div>
				))}
			</div>

			{/* Trend Line */}
			<svg
				className="absolute inset-0 w-full h-full pointer-events-none"
				viewBox="0 0 800 400"
				fill="none"
			>
				<motion.path
					d="M 50 350 Q 200 300, 350 280 T 650 150"
					stroke="url(#trendGradient)"
					strokeWidth="3"
					fill="none"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 0.6 }}
					transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
				/>
				<defs>
					<linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#10b981" />
						<stop offset="100%" stopColor="#3b82f6" />
					</linearGradient>
				</defs>
			</svg>

			{/* Floating Price Tags */}
			{[
				{ label: "$178.45", x: "15%", y: "40%", delay: 1.2 },
				{ label: "$245.30", x: "45%", y: "30%", delay: 1.4 },
				{ label: "$875.20", x: "75%", y: "15%", delay: 1.6 },
			].map((tag, index) => (
				<motion.div
					key={index}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: tag.delay }}
					className="absolute px-3 py-1.5 bg-card/90 backdrop-blur-sm border border-green-500/30 rounded-lg shadow-depth"
					style={{ left: tag.x, top: tag.y }}
				>
					<p className="text-xs font-semibold text-green-600">{tag.label}</p>
				</motion.div>
			))}

			{/* Volume Bars at Bottom */}
			<div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-1 px-8 pb-4 h-16">
				{[30, 45, 25, 50, 60, 35, 55, 70, 40, 65, 75, 50].map((height, index) => (
					<motion.div
						key={index}
						initial={{ height: 0 }}
						animate={{ height: `${height}%` }}
						transition={{ duration: 0.6, delay: 0.1 * index }}
						className="w-full bg-primary-500/20 rounded-t"
					/>
				))}
			</div>
		</div>
	);
}
