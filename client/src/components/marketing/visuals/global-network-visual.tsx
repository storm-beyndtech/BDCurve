import * as React from "react";
import { motion } from "framer-motion";

/**
 * Animated global network visualization for Global Accounts product
 */
export function GlobalNetworkVisual() {
	// Connection points around a circular globe
	const nodes = [
		{ angle: 0, label: "NY" },
		{ angle: 45, label: "LON" },
		{ angle: 90, label: "TOK" },
		{ angle: 135, label: "SYD" },
		{ angle: 180, label: "SG" },
		{ angle: 225, label: "DXB" },
		{ angle: 270, label: "BER" },
		{ angle: 315, label: "SF" },
	];

	const radius = 140;

	return (
		<div className="relative w-full h-full flex items-center justify-center">
			{/* Central globe glow */}
			<motion.div
				className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 blur-3xl"
				animate={{
					scale: [1, 1.3, 1],
					opacity: [0.4, 0.6, 0.4],
				}}
				transition={{
					duration: 5,
					repeat: Infinity,
					ease: "easeInOut",
				}}/>

			{/* Central globe */}
			<motion.div
				className="relative w-48 h-48 rounded-full border-2 border-purple-500/40"
				style={{
					background: "radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.1))",
				}}
				animate={{ rotate: 360 }}
				transition={{
					duration: 60,
					repeat: Infinity,
					ease: "linear",
				}}
			>
				{/* Globe grid lines */}
				{[...Array(5)].map((_, i) => (
					<div
						key={`lat-${i}`}
						className="absolute left-0 right-0 border-t border-purple-400/20"
						style={{ top: `${(i + 1) * 16}%` }}/>
				))}
				{[...Array(5)].map((_, i) => (
					<div
						key={`long-${i}`}
						className="absolute top-0 bottom-0 w-full border-l border-purple-400/20"
						style={{
							left: `${(i + 1) * 16}%`,
							transform: "perspective(200px) rotateY(60deg)",
						}}/>
				))}
			</motion.div>

			{/* Connection nodes around globe */}
			{nodes.map((node, index) => {
				const angleRad = (node.angle * Math.PI) / 180;
				const x = Math.cos(angleRad) * radius;
				const y = Math.sin(angleRad) * radius;

				return (
					<React.Fragment key={node.label}>
						{/* Node */}
						<motion.div
							className="absolute w-8 h-8 rounded-full bg-purple-500/80 border-2 border-purple-300 shadow-lg backdrop-blur-sm"
							style={{
								left: "50%",
								top: "50%",
								marginLeft: x - 16,
								marginTop: y - 16,
							}}
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								duration: 0.5,
								delay: index * 0.1,
								type: "spring",
							}}
						>
							<div className="absolute inset-0 flex items-center justify-center">
								<span className="text-[8px] font-bold text-white">{node.label}</span>
							</div>

							{/* Pulse */}
							<motion.div
								className="absolute inset-0 rounded-full bg-purple-400"
								animate={{
									scale: [1, 2, 2],
									opacity: [0.5, 0, 0],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									delay: index * 0.3,
									ease: "easeOut",
								}}/>
						</motion.div>

						{/* Connection line to center */}
						<svg
							className="absolute inset-0 w-full h-full pointer-events-none"
							style={{ overflow: "visible" }}
						>
							<motion.line
								x1="50%"
								y1="50%"
								x2={`calc(50% + ${x}px)`}
								y2={`calc(50% + ${y}px)`}
								stroke="url(#purpleGradient)"
								strokeWidth="2"
								initial={{ pathLength: 0 }}
								animate={{ pathLength: 1 }}
								transition={{
									duration: 1,
									delay: index * 0.1,
									ease: "easeOut",
								}}/>
						</svg>

						{/* Data packet traveling along line */}
						<motion.div
							className="absolute w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-500/50"
							style={{
								left: "50%",
								top: "50%",
								marginLeft: -4,
								marginTop: -4,
							}}
							animate={{
								x: [0, x],
								y: [0, y],
								opacity: [0, 1, 0],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								delay: index * 0.4,
								ease: "easeInOut",
							}}/>
					</React.Fragment>
				);
			})}

			{/* SVG Definitions */}
			<svg className="absolute inset-0 w-0 h-0">
				<defs>
					<linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.6"/>
						<stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.1"/>
					</linearGradient>
				</defs>
			</svg>

			{/* Orbiting rings */}
			{[...Array(3)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute rounded-full border border-purple-400/20"
					style={{
						width: `${200 + i * 40}px`,
						height: `${200 + i * 40}px`,
						left: "50%",
						top: "50%",
						marginLeft: `${-(100 + i * 20)}px`,
						marginTop: `${-(100 + i * 20)}px`,
					}}
					animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
					transition={{
						duration: 20 + i * 5,
						repeat: Infinity,
						ease: "linear",
					}}/>
			))}
		</div>
	);
}


