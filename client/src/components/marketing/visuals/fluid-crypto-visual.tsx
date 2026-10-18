import React from "react";
import { motion } from "framer-motion";

export function FluidCryptoVisual() {
	return (
		<div className="relative w-full h-full flex items-center justify-center overflow-hidden">
			{/* Subtle orbital paths */}
			<svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 800 600">
				{[150, 220, 290].map((radius, i) => (
					<motion.circle
						key={i}
						cx="400"
						cy="300"
						r={radius}
						fill="none"
						stroke="hsl(var(--primary))"
						strokeWidth="0.5"
						strokeDasharray="3 6"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: 0.5 }}
						transition={{ duration: 2, delay: i * 0.3 }}
					/>
				))}
			</svg>

			{/* Floating crypto symbols - Very minimal */}
			{[
				{ symbol: "₿", angle: 0, radius: 150, duration: 20 },
				{ symbol: "Ξ", angle: 120, radius: 180, duration: 25 },
				{ symbol: "◎", angle: 240, radius: 140, duration: 22 },
			].map((crypto, i) => (
				<motion.div
					key={i}
					className="absolute w-12 h-12 flex items-center justify-center text-2xl text-primary-500/55 font-light"
					initial={{ opacity: 0 }}
					animate={{
						opacity: [0, 0.65, 0.65],
						x: [
							Math.cos((crypto.angle * Math.PI) / 180) * crypto.radius,
							Math.cos(((crypto.angle + 360) * Math.PI) / 180) * crypto.radius,
						],
						y: [
							Math.sin((crypto.angle * Math.PI) / 180) * crypto.radius,
							Math.sin(((crypto.angle + 360) * Math.PI) / 180) * crypto.radius,
						],
					}}
					transition={{
						opacity: { duration: 2, delay: i * 0.4 },
						x: { duration: crypto.duration, repeat: Infinity, ease: "linear" },
						y: { duration: crypto.duration, repeat: Infinity, ease: "linear" },
					}}
				>
					{crypto.symbol}
				</motion.div>
			))}

			{/* Subtle pulse in center */}
			<motion.div
				className="absolute w-32 h-32 rounded-full border border-primary-500/40"
				animate={{
					scale: [1, 1.3, 1],
					opacity: [0.55, 0.3, 0.55],
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Inner pulse */}
			<motion.div
				className="absolute w-16 h-16 rounded-full border border-accent-500/40"
				animate={{
					scale: [1, 1.5, 1],
					opacity: [0.65, 0.3, 0.65],
				}}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 0.5,
				}}
			/>

			{/* Minimal text overlay */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.25 }}
				transition={{ duration: 2, delay: 1 }}
				className="absolute inset-0 flex items-center justify-center text-[180px] font-light text-primary-500/15 select-none"
			>
				24/7
			</motion.div>
		</div>
	);
}
