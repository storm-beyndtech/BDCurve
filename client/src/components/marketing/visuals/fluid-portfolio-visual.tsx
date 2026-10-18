import React from "react";
import { motion } from "framer-motion";

export function FluidPortfolioVisual() {
	return (
		<div className="relative w-full h-full flex items-center justify-center">
			{/* Connecting lines network - Very subtle */}
			<svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 800 600">
				{/* Horizontal lines */}
				{[200, 300, 400].map((y, i) => (
					<motion.line
						key={`h-${i}`}
						x1="100"
						y1={y}
						x2="700"
						y2={y}
						stroke="hsl(var(--primary))"
						strokeWidth="0.5"
						strokeDasharray="4 8"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 3, delay: i * 0.3, ease: "easeInOut" }}
					/>
				))}

				{/* Diagonal connections */}
				<motion.path
					d="M 200 200 L 400 300 L 600 200 L 400 400 Z"
					stroke="hsl(var(--accent))"
					strokeWidth="0.5"
					fill="none"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 0.6 }}
					transition={{ duration: 4, delay: 0.5 }}
				/>
			</svg>

			{/* Floating nodes - minimal dots */}
			{[
				{ x: "25%", y: "35%", delay: 0, size: "w-3 h-3" },
				{ x: "50%", y: "50%", delay: 0.3, size: "w-4 h-4" },
				{ x: "75%", y: "35%", delay: 0.6, size: "w-3 h-3" },
				{ x: "50%", y: "70%", delay: 0.9, size: "w-3 h-3" },
			].map((node, i) => (
				<motion.div
					key={i}
					className={`absolute ${node.size} rounded-full bg-primary-500/60 backdrop-blur-sm`}
					style={{ left: node.x, top: node.y }}
					initial={{ scale: 0, opacity: 0 }}
					animate={{
						scale: [0, 1.2, 1],
						opacity: [0, 0.75, 0.65],
					}}
					transition={{
						duration: 2,
						delay: node.delay,
					}}
				>
					{/* Outer ring animation */}
					<motion.div
						className="absolute inset-0 rounded-full border border-primary-500/40"
						animate={{
							scale: [1, 2, 2.5],
							opacity: [0.6, 0.3, 0],
						}}
						transition={{
							duration: 3,
							delay: node.delay + 1,
							repeat: Infinity,
							repeatDelay: 3,
						}}
					/>
				</motion.div>
			))}

			{/* Flowing particles */}
			{[...Array(8)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute w-1 h-1 rounded-full bg-primary-500/30"
					initial={{
						x: "50%",
						y: "50%",
						opacity: 0,
					}}
					animate={{
						x: `${50 + (Math.cos((i * 45 * Math.PI) / 180) * 40)}%`,
						y: `${50 + (Math.sin((i * 45 * Math.PI) / 180) * 40)}%`,
						opacity: [0, 0.7, 0],
					}}
					transition={{
						duration: 4,
						delay: i * 0.5,
						repeat: Infinity,
						repeatDelay: 2,
					}}
				/>
			))}

			{/* Center subtle glow */}
			<motion.div
				className="absolute w-40 h-40 rounded-full bg-primary-500/10 blur-3xl"
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.4, 0.6, 0.4],
				}}
				transition={{
					duration: 5,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}
