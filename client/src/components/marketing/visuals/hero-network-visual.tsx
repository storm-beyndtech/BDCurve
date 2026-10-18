import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Animated network/connection visual for hero sections
 * Creates flowing connection lines and nodes with eerie, futuristic feel
 */
export function HeroNetworkVisual() {
	// Node positions (percentage based)
	const nodes = [
		{ x: 20, y: 25, size: 8, delay: 0 },
		{ x: 35, y: 45, size: 6, delay: 0.3 },
		{ x: 55, y: 30, size: 10, delay: 0.6 },
		{ x: 70, y: 55, size: 7, delay: 0.9 },
		{ x: 45, y: 70, size: 9, delay: 1.2 },
		{ x: 80, y: 35, size: 5, delay: 1.5 },
		{ x: 25, y: 60, size: 8, delay: 1.8 },
		{ x: 60, y: 50, size: 6, delay: 2.1 },
	];

	// Connection lines between nodes
	const connections = [
		{ from: 0, to: 1 },
		{ from: 1, to: 2 },
		{ from: 2, to: 3 },
		{ from: 3, to: 4 },
		{ from: 1, to: 4 },
		{ from: 2, to: 5 },
		{ from: 4, to: 6 },
		{ from: 2, to: 7 },
		{ from: 7, to: 3 },
	];

	return (
		<div className="absolute inset-0 overflow-hidden opacity-30">
			<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
				{/* Connection Lines */}
				{connections.map((conn, index) => {
					const fromNode = nodes[conn.from];
					const toNode = nodes[conn.to];

					return (
						<motion.line
							key={`line-${index}`}
							x1={fromNode.x}
							y1={fromNode.y}
							x2={toNode.x}
							y2={toNode.y}
							stroke="url(#lineGradient)"
							strokeWidth="0.2"
							strokeLinecap="round"
							initial={{ pathLength: 0, opacity: 0 }}
							animate={{
								pathLength: [0, 1, 1, 0],
								opacity: [0, 0.6, 0.6, 0],
							}}
							transition={{
								duration: 4,
								delay: index * 0.4,
								repeat: Infinity,
								ease: "easeInOut",
							}}/>
					);
				})}

				{/* Pulsing particles along lines */}
				{connections.map((conn, index) => {
					const fromNode = nodes[conn.from];
					const toNode = nodes[conn.to];

					return (
						<motion.circle
							key={`particle-${index}`}
							r="0.4"
							fill="currentColor"
							className="text-primary-500"
							initial={{ opacity: 0 }}
							animate={{
								cx: [fromNode.x, toNode.x],
								cy: [fromNode.y, toNode.y],
								opacity: [0, 1, 0],
							}}
							transition={{
								duration: 3,
								delay: index * 0.5,
								repeat: Infinity,
								ease: "linear",
							}}/>
					);
				})}

				{/* Gradient definitions */}
				<defs>
					<linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="currentColor" className="text-primary-500" stopOpacity="0.2"/>
						<stop offset="50%" stopColor="currentColor" className="text-primary-400" stopOpacity="0.6"/>
						<stop offset="100%" stopColor="currentColor" className="text-accent-500" stopOpacity="0.2"/>
					</linearGradient>
				</defs>
			</svg>

			{/* Animated nodes */}
			{nodes.map((node, index) => (
				<motion.div
					key={`node-${index}`}
					className="absolute rounded-full bg-primary-500/20 border border-primary-500/40"
					style={{
						left: `${node.x}%`,
						top: `${node.y}%`,
						width: `${node.size}px`,
						height: `${node.size}px`,
						transform: "translate(-50%, -50%)",
					}}
					initial={{ scale: 0, opacity: 0 }}
					animate={{
						scale: [1, 1.3, 1],
						opacity: [0.4, 0.8, 0.4],
					}}
					transition={{
						duration: 3,
						delay: node.delay,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				>
					{/* Inner glow */}
					<div className="absolute inset-0 rounded-full bg-primary-500/60 blur-sm"/>
				</motion.div>
			))}

			{/* Floating data packets */}
			{[...Array(12)].map((_, i) => {
				// Deterministic pseudo-random values based on index to avoid hydration mismatch
				const topOffset = ((i * 37) % 60) + 20; // Pseudo-random top position
				const xMovement = ((i * 17) % 20) - 10; // Pseudo-random x movement
				const duration = 4 + ((i * 13) % 20) / 10; // Pseudo-random duration

				return (
					<motion.div
						key={`packet-${i}`}
						className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
						style={{
							left: `${10 + i * 8}%`,
							top: `${topOffset}%`,
						}}
						animate={{
							y: [-10, -60, -10],
							x: [0, xMovement, 0],
							opacity: [0, 0.8, 0],
							scale: [0.5, 1, 0.5],
						}}
						transition={{
							duration,
							delay: i * 0.4,
							repeat: Infinity,
							ease: "easeInOut",
						}}/>
				);
			})}
		</div>
	);
}

/**
 * Compact version with fewer elements
 */
export function HeroNetworkVisualCompact() {
	const nodes = [
		{ x: 25, y: 30, size: 6 },
		{ x: 50, y: 45, size: 8 },
		{ x: 75, y: 35, size: 6 },
		{ x: 40, y: 65, size: 7 },
	];

	return (
		<div className="absolute inset-0 overflow-hidden opacity-20">
			<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
				<motion.line
					x1={nodes[0].x}
					y1={nodes[0].y}
					x2={nodes[1].x}
					y2={nodes[1].y}
					stroke="currentColor"
					className="text-primary-500"
					strokeWidth="0.15"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: [0, 1, 0] }}
					transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}/>
				<motion.line
					x1={nodes[1].x}
					y1={nodes[1].y}
					x2={nodes[2].x}
					y2={nodes[2].y}
					stroke="currentColor"
					className="text-accent-500"
					strokeWidth="0.15"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: [0, 1, 0] }}
					transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}/>
			</svg>

			{nodes.map((node, index) => (
				<motion.div
					key={index}
					className="absolute rounded-full bg-primary-500/20 border border-primary-500/30"
					style={{
						left: `${node.x}%`,
						top: `${node.y}%`,
						width: `${node.size}px`,
						height: `${node.size}px`,
						transform: "translate(-50%, -50%)",
					}}
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.6, 0.3],
					}}
					transition={{
						duration: 2,
						delay: index * 0.3,
						repeat: Infinity,
					}}/>
			))}
		</div>
	);
}


