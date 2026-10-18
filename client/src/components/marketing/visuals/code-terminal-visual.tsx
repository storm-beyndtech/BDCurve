import * as React from "react";
import { motion } from "framer-motion";

/**
 * Animated code terminal visualization for API/Developer product
 */
export function CodeTerminalVisual() {
	const codeLines = [
		'const payment = await api.createPayment({',
		'  amount: 1000,',
		'  currency: "USD",',
		'  method: "card"',
		'});',
		'',
		'// Response: { id: "pay_123", status: "success" }',
	];

	return (
		<div className="relative w-full h-full flex items-center justify-center">
			{/* Glow effect */}
			<motion.div
				className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl"
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.3, 0.5, 0.3],
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
					ease: "easeInOut",
				}}/>

			{/* Terminal window */}
			<motion.div
				className="relative w-[400px] rounded-xl overflow-hidden shadow-2xl border border-purple-500/30"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				style={{
					background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))",
					backdropFilter: "blur(20px)",
				}}
			>
				{/* Terminal header */}
				<div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
					<div className="flex gap-1.5">
						<div className="w-3 h-3 rounded-full bg-red-500/80"/>
						<div className="w-3 h-3 rounded-full bg-yellow-500/80"/>
						<div className="w-3 h-3 rounded-full bg-green-500/80"/>
					</div>
					<span className="text-xs text-gray-400 ml-2">terminal.sh</span>
				</div>

				{/* Code content */}
				<div className="p-4 font-mono text-sm">
					{codeLines.map((line, index) => (
						<motion.div
							key={index}
							className="mb-1"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{
								duration: 0.3,
								delay: index * 0.15,
								ease: "easeOut",
							}}
						>
							{line.includes("//") ? (
								<span className="text-gray-500">{line}</span>
							) : line.includes("const") || line.includes("await") ? (
								<>
									<span className="text-purple-400">
										{line.split(" ")[0]} {line.split(" ")[1]}
									</span>
									<span className="text-gray-300">{line.slice(line.indexOf(" ", line.indexOf(" ") + 1))}</span>
								</>
							) : line.includes(":") && !line.includes("//") ? (
								<>
									<span className="text-blue-400">{line.split(":")[0]}:</span>
									<span className="text-emerald-400">{line.split(":").slice(1).join(":")}</span>
								</>
							) : (
								<span className="text-gray-300">{line}</span>
							)}
						</motion.div>
					))}

					{/* Blinking cursor */}
					<motion.span
						className="inline-block w-2 h-4 bg-purple-400 ml-1"
						animate={{ opacity: [1, 0, 1] }}
						transition={{
							duration: 1,
							repeat: Infinity,
							ease: "easeInOut",
						}}/>
				</div>
			</motion.div>

			{/* Floating code brackets */}
			{["{ }", "[ ]", "< >", "( )"].map((bracket, i) => {
				const angle = (i / 4) * Math.PI * 2;
				const radius = 200;
				const x = Math.cos(angle) * radius;
				const y = Math.sin(angle) * radius;

				return (
					<motion.div
						key={i}
						className="absolute text-2xl font-mono text-purple-400/40 font-bold"
						style={{
							left: "50%",
							top: "50%",
						}}
						animate={{
							x: [0, x, 0],
							y: [0, y, 0],
							opacity: [0, 0.6, 0],
							rotate: [0, 180, 360],
						}}
						transition={{
							duration: 6,
							repeat: Infinity,
							delay: i * 0.5,
							ease: "easeInOut",
						}}
					>
						{bracket}
					</motion.div>
				);
			})}

			{/* Data flow lines */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none">
				<defs>
					<linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.4"/>
						<stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0"/>
					</linearGradient>
				</defs>

				{[...Array(4)].map((_, i) => (
					<motion.path
						key={i}
						d={`M ${10 + i * 90},${300 - i * 40} Q ${200},${200} ${390 - i * 90},${100 + i * 40}`}
						fill="none"
						stroke="url(#codeGradient)"
						strokeWidth="2"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
						transition={{
							duration: 3,
							repeat: Infinity,
							delay: i * 0.4,
							ease: "easeInOut",
						}}/>
				))}
			</svg>

			{/* Floating particles */}
			{[...Array(12)].map((_, i) => {
				const leftOffset = 10 + ((i * 43) % 80);
				const topOffset = 10 + ((i * 29) % 80);

				return (
					<motion.div
						key={i}
						className="absolute w-1 h-1 rounded-full bg-purple-400"
						style={{
							left: `${leftOffset}%`,
							top: `${topOffset}%`,
						}}
						animate={{
							opacity: [0, 1, 0],
							scale: [0, 1, 0],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							delay: i * 0.15,
							ease: "easeInOut",
						}}/>
				);
			})}
		</div>
	);
}


