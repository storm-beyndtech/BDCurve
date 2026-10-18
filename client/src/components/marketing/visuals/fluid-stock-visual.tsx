import React from "react";
import { motion } from "framer-motion";

export function FluidStockVisual() {
	return (
		<div className="relative w-full h-full flex items-center justify-center">
			{/* Floating Price Lines - Very Subtle */}
			<svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 800 600" fill="none">
				{/* Main trend line */}
				<motion.path
					d="M 100 450 Q 200 380, 300 420 T 500 320 T 700 250"
					stroke="hsl(var(--primary))"
					strokeWidth="1.5"
					fill="none"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 0.7 }}
					transition={{
						pathLength: { duration: 3, ease: "easeInOut" },
						opacity: { duration: 1 },
					}}
				/>

				{/* Supporting line 1 */}
				<motion.path
					d="M 100 470 Q 200 400, 300 440 T 500 340 T 700 270"
					stroke="hsl(var(--primary))"
					strokeWidth="1"
					strokeDasharray="4 4"
					fill="none"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 0.5 }}
					transition={{
						pathLength: { duration: 3.5, delay: 0.3, ease: "easeInOut" },
						opacity: { duration: 1, delay: 0.3 },
					}}
				/>

				{/* Supporting line 2 */}
				<motion.path
					d="M 100 430 Q 200 360, 300 400 T 500 300 T 700 230"
					stroke="hsl(var(--accent))"
					strokeWidth="1"
					strokeDasharray="4 4"
					fill="none"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 0.5 }}
					transition={{
						pathLength: { duration: 3.5, delay: 0.6, ease: "easeInOut" },
						opacity: { duration: 1, delay: 0.6 },
					}}
				/>
			</svg>

			{/* Floating Minimal Nodes */}
			{[
				{ x: "25%", y: "65%", delay: 0 },
				{ x: "40%", y: "55%", delay: 0.4 },
				{ x: "60%", y: "45%", delay: 0.8 },
				{ x: "80%", y: "35%", delay: 1.2 },
			].map((node, i) => (
				<motion.div
					key={i}
					className="absolute w-2 h-2 rounded-full bg-primary-500/60"
					style={{ left: node.x, top: node.y }}
					initial={{ scale: 0, opacity: 0 }}
					animate={{
						scale: [0, 1.2, 1],
						opacity: [0, 0.85, 0.75],
					}}
					transition={{
						duration: 2,
						delay: node.delay,
						ease: "easeOut",
					}}
				>
					{/* Pulse ring */}
					<motion.div
						className="absolute inset-0 rounded-full border border-primary-500/40"
						animate={{
							scale: [1, 2.5, 3],
							opacity: [0.6, 0.3, 0],
						}}
						transition={{
							duration: 2,
							delay: node.delay + 1,
							repeat: Infinity,
							repeatDelay: 2,
						}}
					/>
				</motion.div>
			))}

			{/* Minimal Text - Very Subtle */}
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.30 }}
					transition={{ duration: 2, delay: 1 }}
					className="text-[200px] font-bold text-primary-500/15 select-none"
				>
					$
				</motion.div>
			</div>
		</div>
	);
}
