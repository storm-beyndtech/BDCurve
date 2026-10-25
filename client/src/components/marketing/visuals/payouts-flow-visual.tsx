import * as React from "react";
import { motion } from "framer-motion";

export function PayoutsFlowVisual() {
	// Currency streams configuration
	const streams = [
		{ currency: "USD", color: "from-green-500 to-emerald-600", delay: 0, y: 15 },
		{ currency: "EUR", color: "from-blue-500 to-cyan-600", delay: 0.3, y: 35 },
		{ currency: "GBP", color: "from-purple-500 to-violet-600", delay: 0.6, y: 55 },
		{ currency: "JPY", color: "from-orange-500 to-amber-600", delay: 0.9, y: 75 },
	];

	// Deterministic positions for payment nodes
	const paymentNodes = [...Array(8)].map((_, i) => ({
		x: 15 + ((i * 37) % 70),
		y: 20 + ((i * 43) % 60),
		delay: i * 0.15,
		duration: 3 + ((i * 11) % 20) / 10,
	}));

	return (
		<div className="relative w-full h-full flex items-center justify-center overflow-hidden">
			{/* Central hub glow */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-green-500/30 to-emerald-500/20 rounded-full blur-3xl"
				animate={{
					scale: [1, 1.3, 1],
					opacity: [0.4, 0.6, 0.4],
				}}
				transition={{
					duration: 5,
					repeat: Infinity,
					ease: "easeInOut",
				}}/>

			{/* Central processing hub */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
				initial={{ scale: 0, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
			>
				<motion.div
					className="w-28 h-28 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl flex items-center justify-center border border-white/20"
					animate={{
						boxShadow: [
							"0 0 20px rgba(34, 197, 94, 0.3)",
							"0 0 40px rgba(34, 197, 94, 0.5)",
							"0 0 20px rgba(34, 197, 94, 0.3)",
						],
					}}
					transition={{
						duration: 3,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				>
					<svg
						className="w-12 h-12 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</motion.div>

				{/* Orbiting rings */}
				{[...Array(3)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green-500/20"
						style={{
							width: 140 + i * 40,
							height: 140 + i * 40,
						}}
						animate={{
							rotate: [0, 360],
							borderColor: [
								"rgba(34, 197, 94, 0.2)",
								"rgba(34, 197, 94, 0.4)",
								"rgba(34, 197, 94, 0.2)",
							],
						}}
						transition={{
							rotate: {
								duration: 15 + i * 5,
								repeat: Infinity,
								ease: "linear",
							},
							borderColor: {
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
							},
						}}/>
				))}
			</motion.div>

			{/* Currency streams */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none">
				<defs>
					{streams.map((stream, i) => (
						<linearGradient key={i} id={`stream-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="transparent"/>
							<stop offset="50%" stopColor={`rgba(34, 197, 94, 0.6)`}/>
							<stop offset="100%" stopColor="transparent"/>
						</linearGradient>
					))}
				</defs>

				{streams.map((stream, i) => (
					<g key={i}>
						{/* Flow lines */}
						<motion.path
							d={`M 0 ${stream.y}% Q 25% ${stream.y - 10}%, 50% ${stream.y}% T 100% ${stream.y}%`}
							fill="none"
							stroke={`url(#stream-${i})`}
							strokeWidth="3"
							initial={{ pathLength: 0, opacity: 0 }}
							animate={{
								pathLength: [0, 1],
								opacity: [0, 0.8, 0],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								delay: stream.delay,
								ease: "easeInOut",
							}}/>
					</g>
				))}
			</svg>

			{/* Flowing payment packets */}
			{streams.map((stream, streamIndex) => (
				<React.Fragment key={streamIndex}>
					{[...Array(3)].map((_, packetIndex) => {
						const xPos = ((packetIndex * 53) % 80) + 10;
						const delay = stream.delay + packetIndex * 0.4;

						return (
							<motion.div
								key={`${streamIndex}-${packetIndex}`}
								className="absolute"
								style={{
									left: `${xPos}%`,
									top: `${stream.y}%`,
								}}
								initial={{ opacity: 0, scale: 0 }}
								animate={{
									opacity: [0, 1, 1, 0],
									scale: [0, 1, 1, 0],
									x: [0, 50, 100],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									delay,
									ease: "easeInOut",
								}}
							>
								<div className={`w-12 h-8 rounded-lg bg-gradient-to-r ${stream.color} shadow-lg flex items-center justify-center border border-white/20`}>
									<span className="text-[10px] font-bold text-white">
										{stream.currency}
									</span>
								</div>
							</motion.div>
						);
					})}
				</React.Fragment>
			))}

			{/* Payment destination nodes */}
			{paymentNodes.map((node, i) => (
				<motion.div
					key={i}
					className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg border border-white/30"
					style={{
						left: `${node.x}%`,
						top: `${node.y}%`,
					}}
					initial={{ opacity: 0, scale: 0 }}
					animate={{
						opacity: [0, 1, 1, 0],
						scale: [0, 1.2, 1, 0],
					}}
					transition={{
						duration: node.duration,
						repeat: Infinity,
						delay: node.delay,
						ease: "easeInOut",
					}}
				>
					{/* Ripple effect */}
					<motion.div
						className="absolute inset-0 rounded-full border-2 border-green-400"
						animate={{
							scale: [1, 2.5],
							opacity: [0.6, 0],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							delay: node.delay,
							ease: "easeOut",
						}}/>
				</motion.div>
			))}

			{/* Floating currency symbols */}
			{["$", "€", "£", "¥"].map((symbol, i) => {
				const xOffset = 20 + ((i * 47) % 60);
				const yOffset = 15 + ((i * 31) % 70);
				const duration = 4 + ((i * 13) % 20) / 10;

				return (
					<motion.div
						key={symbol}
						className="absolute text-5xl font-bold text-green-500/10"
						style={{
							left: `${xOffset}%`,
							top: `${yOffset}%`,
						}}
						animate={{
							y: [0, -30, 0],
							opacity: [0.1, 0.2, 0.1],
							rotate: [0, 10, 0],
						}}
						transition={{
							duration,
							repeat: Infinity,
							ease: "easeInOut",
							delay: i * 0.3,
						}}
					>
						{symbol}
					</motion.div>
				);
			})}

			{/* Data particles */}
			{[...Array(20)].map((_, i) => {
				const xPos = ((i * 41) % 90) + 5;
				const yPos = ((i * 37) % 90) + 5;
				const duration = 2 + ((i * 17) % 30) / 10;

				return (
					<motion.div
						key={i}
						className="absolute w-1 h-1 rounded-full bg-green-400/40"
						style={{
							left: `${xPos}%`,
							top: `${yPos}%`,
						}}
						animate={{
							opacity: [0, 1, 0],
							scale: [0, 1.5, 0],
						}}
						transition={{
							duration,
							repeat: Infinity,
							delay: i * 0.1,
							ease: "easeInOut",
						}}/>
				);
			})}

			{/* Success checkmarks animation */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none">
				{[...Array(4)].map((_, i) => {
					const cx = 20 + ((i * 43) % 60);
					const cy = 25 + ((i * 37) % 50);

					return (
						<motion.g key={i}>
							<motion.circle
								cx={`${cx}%`}
								cy={`${cy}%`}
								r="12"
								fill="none"
								stroke="rgba(34, 197, 94, 0.6)"
								strokeWidth="2"
								initial={{ pathLength: 0, opacity: 0 }}
								animate={{
									pathLength: [0, 1],
									opacity: [0, 1, 0],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									delay: i * 0.5,
									ease: "easeInOut",
								}}/>
							<motion.path
								d={`M ${cx - 1.5}% ${cy}% L ${cx}% ${cy + 1.5}% L ${cx + 2}% ${cy - 1.5}%`}
								fill="none"
								stroke="rgba(34, 197, 94, 0.8)"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								initial={{ pathLength: 0, opacity: 0 }}
								animate={{
									pathLength: [0, 1],
									opacity: [0, 1, 0],
								}}
								transition={{
									duration: 1.5,
									repeat: Infinity,
									delay: i * 0.5 + 0.3,
									ease: "easeOut",
								}}/>
						</motion.g>
					);
				})}
			</svg>
		</div>
	);
}


