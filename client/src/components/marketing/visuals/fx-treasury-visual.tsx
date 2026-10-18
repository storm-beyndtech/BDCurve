import * as React from "react";
import { motion } from "framer-motion";

export function FXTreasuryVisual() {
	// Currency pairs with exchange rates
	const currencyPairs = [
		{ from: "USD", to: "EUR", rate: "0.92", color: "from-purple-500 to-violet-600", x: 20, y: 25 },
		{ from: "GBP", to: "USD", rate: "1.27", color: "from-blue-500 to-cyan-600", x: 50, y: 20 },
		{ from: "JPY", to: "USD", rate: "0.0067", color: "from-pink-500 to-rose-600", x: 80, y: 30 },
		{ from: "AUD", to: "EUR", rate: "0.60", color: "from-green-500 to-emerald-600", x: 30, y: 60 },
		{ from: "CHF", to: "GBP", rate: "0.89", color: "from-orange-500 to-amber-600", x: 70, y: 65 },
	];

	// Animated chart bars
	const chartBars = [...Array(12)].map((_, i) => {
		const height = 30 + ((i * 37) % 50);
		const delay = i * 0.08;
		return { height, delay };
	});

	// Floating rate indicators
	const rateIndicators = [...Array(8)].map((_, i) => ({
		x: 15 + ((i * 41) % 70),
		y: 20 + ((i * 43) % 60),
		change: ((i % 3) - 1) * 0.5, // -0.5, 0, 0.5
		duration: 3 + ((i * 13) % 20) / 10,
		delay: i * 0.2,
	}));

	return (
		<div className="relative w-full h-full flex items-center justify-center overflow-hidden">
			{/* Subtle ambient gradient glow */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-blue-500/10 rounded-full blur-3xl"
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.3, 0.4, 0.3],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: "easeInOut",
				}}/>

			{/* Central FX hub */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
				initial={{ scale: 0, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
			>
				<motion.div
					className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-600 to-violet-700 shadow-2xl flex flex-col items-center justify-center border border-white/10"
					animate={{
						boxShadow: [
							"0 0 15px rgba(168, 85, 247, 0.2)",
							"0 0 30px rgba(168, 85, 247, 0.3)",
							"0 0 15px rgba(168, 85, 247, 0.2)",
						],
					}}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				>
					<div className="text-xs font-bold text-white/70">FX RATE</div>
					<motion.div
						className="text-2xl font-bold text-white"
						animate={{
							scale: [1, 1.05, 1],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						1.00
					</motion.div>
					<svg className="w-6 h-6 text-white/70 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
					</svg>
				</motion.div>

				{/* Orbiting rate rings */}
				{[...Array(3)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
						style={{
							width: 150 + i * 50,
							height: 150 + i * 50,
							borderColor: `rgba(168, 85, 247, ${0.15 - i * 0.03})`,
						}}
						animate={{
							rotate: [0, 360],
							borderColor: [
								`rgba(168, 85, 247, ${0.15 - i * 0.03})`,
								`rgba(168, 85, 247, ${0.25 - i * 0.03})`,
								`rgba(168, 85, 247, ${0.15 - i * 0.03})`,
							],
						}}
						transition={{
							rotate: {
								duration: 20 + i * 5,
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

			{/* Currency pair exchange nodes */}
			{currencyPairs.map((pair, i) => (
				<motion.div
					key={i}
					className="absolute z-10"
					style={{
						left: `${pair.x}%`,
						top: `${pair.y}%`,
						transform: "translate(-50%, -50%)",
					}}
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						duration: 0.6,
						delay: i * 0.15,
						ease: "easeOut",
					}}
				>
					<motion.div
						className={`relative w-24 h-20 rounded-xl bg-gradient-to-br ${pair.color} shadow-lg border border-white/20 p-2`}
						animate={{
							y: [0, -8, 0],
						}}
						transition={{
							duration: 3 + i * 0.5,
							repeat: Infinity,
							ease: "easeInOut",
							delay: i * 0.2,
						}}
					>
						<div className="flex items-center justify-between text-white">
							<span className="text-sm font-bold">{pair.from}</span>
							<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
								<path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"/>
							</svg>
							<span className="text-sm font-bold">{pair.to}</span>
						</div>
						<motion.div
							className="mt-1 text-center"
							animate={{
								opacity: [0.8, 1, 0.8],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						>
							<div className="text-xs text-white/70">Rate</div>
							<div className="text-sm font-bold text-white">{pair.rate}</div>
						</motion.div>

						{/* Conversion arrow animation */}
						<motion.div
							className="absolute -right-2 top-1/2 -translate-y-1/2"
							animate={{
								x: [0, 5, 0],
								opacity: [0.5, 1, 0.5],
							}}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						>
							<div className="w-2 h-2 rounded-full bg-white"/>
						</motion.div>
					</motion.div>

					{/* Pulse effect */}
					<motion.div
						className="absolute inset-0 rounded-xl border-2 border-purple-400"
						animate={{
							scale: [1, 1.3],
							opacity: [0.6, 0],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeOut",
							delay: i * 0.3,
						}}/>
				</motion.div>
			))}

			{/* Exchange flow lines connecting pairs */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none">
				<defs>
					<linearGradient id="exchangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="rgba(168, 85, 247, 0)"/>
						<stop offset="50%" stopColor="rgba(168, 85, 247, 0.6)"/>
						<stop offset="100%" stopColor="rgba(168, 85, 247, 0)"/>
					</linearGradient>
				</defs>

				{currencyPairs.map((pair, i) => {
					const nextPair = currencyPairs[(i + 1) % currencyPairs.length];
					return (
						<motion.line
							key={i}
							x1={`${pair.x}%`}
							y1={`${pair.y}%`}
							x2={`${nextPair.x}%`}
							y2={`${nextPair.y}%`}
							stroke="url(#exchangeGradient)"
							strokeWidth="2"
							strokeDasharray="4 4"
							initial={{ pathLength: 0, opacity: 0 }}
							animate={{
								pathLength: [0, 1],
								opacity: [0, 0.5, 0],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								delay: i * 0.4,
								ease: "easeInOut",
							}}/>
					);
				})}
			</svg>

			{/* Mini bar chart visualization */}
			<motion.div
				className="absolute bottom-[15%] left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-20"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.5 }}
			>
				{chartBars.map((bar, i) => (
					<motion.div
						key={i}
						className="w-2 bg-gradient-to-t from-purple-500 to-violet-400 rounded-t"
						initial={{ height: 0 }}
						animate={{
							height: `${bar.height}%`,
						}}
						transition={{
							duration: 1,
							delay: bar.delay,
							ease: "easeOut",
						}}
					>
						<motion.div
							className="w-full h-full"
							animate={{
								opacity: [0.7, 1, 0.7],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut",
								delay: bar.delay,
							}}/>
					</motion.div>
				))}
			</motion.div>

			{/* Floating rate change indicators */}
			{rateIndicators.map((indicator, i) => {
				const isPositive = indicator.change > 0;
				const isNeutral = indicator.change === 0;

				return (
					<motion.div
						key={i}
						className="absolute"
						style={{
							left: `${indicator.x}%`,
							top: `${indicator.y}%`,
						}}
						initial={{ opacity: 0, scale: 0 }}
						animate={{
							opacity: [0, 1, 1, 0],
							scale: [0, 1, 1, 0],
							y: [0, -20],
						}}
						transition={{
							duration: indicator.duration,
							repeat: Infinity,
							delay: indicator.delay,
							ease: "easeOut",
						}}
					>
						<div
							className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
								isNeutral
									? "bg-gray-500/80 text-white"
									: isPositive
									? "bg-green-500/80 text-white"
									: "bg-red-500/80 text-white"
							}`}
						>
							{!isNeutral && (
								<svg
									className="w-3 h-3"
									fill="currentColor"
									viewBox="0 0 24 24"
									style={{
										transform: isPositive ? "rotate(0deg)" : "rotate(180deg)",
									}}
								>
									<path d="M7 14l5-5 5 5z"/>
								</svg>
							)}
							<span>{isNeutral ? "0.0%" : `${Math.abs(indicator.change)}%`}</span>
						</div>
					</motion.div>
				);
			})}

			{/* Floating currency symbols */}
			{["$", "â‚¬", "Â£", "Â¥", "â‚£"].map((symbol, i) => {
				const xOffset = 15 + ((i * 47) % 70);
				const yOffset = 20 + ((i * 37) % 60);
				const duration = 5 + ((i * 13) % 30) / 10;

				return (
					<motion.div
						key={symbol}
						className="absolute text-6xl font-bold text-purple-500/10"
						style={{
							left: `${xOffset}%`,
							top: `${yOffset}%`,
						}}
						animate={{
							y: [0, -25, 0],
							opacity: [0.05, 0.15, 0.05],
							rotate: [0, 8, 0],
						}}
						transition={{
							duration,
							repeat: Infinity,
							ease: "easeInOut",
							delay: i * 0.4,
						}}
					>
						{symbol}
					</motion.div>
				);
			})}

			{/* Data flow particles */}
			{[...Array(25)].map((_, i) => {
				const xPos = ((i * 43) % 90) + 5;
				const yPos = ((i * 37) % 90) + 5;
				const duration = 2 + ((i * 17) % 30) / 10;

				return (
					<motion.div
						key={i}
						className="absolute w-1 h-1 rounded-full bg-purple-400/40"
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
							delay: i * 0.08,
							ease: "easeInOut",
						}}/>
				);
			})}

			{/* Treasury lock icons */}
			{[...Array(3)].map((_, i) => {
				const xPos = 25 + ((i * 47) % 50);
				const yPos = 30 + ((i * 41) % 40);

				return (
					<motion.div
						key={i}
						className="absolute w-8 h-8 text-purple-500/20"
						style={{
							left: `${xPos}%`,
							top: `${yPos}%`,
						}}
						animate={{
							y: [0, -15, 0],
							rotate: [0, 10, 0],
							opacity: [0.1, 0.3, 0.1],
						}}
						transition={{
							duration: 4 + i * 0.5,
							repeat: Infinity,
							ease: "easeInOut",
							delay: i * 0.5,
						}}
					>
						<svg fill="currentColor" viewBox="0 0 24 24">
							<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
						</svg>
					</motion.div>
				);
			})}
		</div>
	);
}


