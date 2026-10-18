import * as React from "react";
import { motion } from "framer-motion";

/**
 * Animated 3D card stack visualization for Card Issuing product
 */
export function CardStackVisual() {
	const cards = [
		{ rotation: -8, z: 0, color: "from-slate-700 to-slate-800", accentColor: "from-green-400/20 to-emerald-400/20", delay: 0 },
		{ rotation: -4, z: 20, color: "from-slate-600 to-slate-700", accentColor: "from-green-400/15 to-emerald-400/15", delay: 0.2 },
		{ rotation: 0, z: 40, color: "from-slate-500 to-slate-600", accentColor: "from-green-400/10 to-emerald-400/10", delay: 0.4 },
	];

	return (
		<div className="relative w-full h-full flex items-center justify-center">
			{/* Subtle glow effects */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-br from-green-500/8 to-emerald-500/5 blur-3xl rounded-full"
				animate={{
					scale: [1, 1.1, 1],
					opacity: [0.2, 0.3, 0.2],
				}}
				transition={{
					duration: 6,
					repeat: Infinity,
					ease: "easeInOut",
				}}/>

			{/* Card stack */}
			<div className="relative w-80 h-52 perspective-1000">
				{cards.map((card, index) => (
					<motion.div
						key={index}
						className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.color} shadow-2xl border border-white/10`}
						style={{
							transform: `translateZ(${card.z}px) rotateZ(${card.rotation}deg)`,
							transformStyle: "preserve-3d",
						}}
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.8,
							delay: card.delay,
							ease: "easeOut",
						}}
					>
						{/* Subtle accent overlay */}
						<div className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${card.accentColor}`}/>

						{/* Card details */}
						<div className="relative p-6 h-full flex flex-col justify-between">
							{/* Chip */}
							<motion.div
								className="w-12 h-10 rounded bg-gradient-to-br from-yellow-400/60 to-amber-500/60 shadow-lg backdrop-blur-sm"
								animate={{ opacity: [0.6, 0.8, 0.6] }}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
								}}/>

							{/* Card number dots */}
							<div className="flex gap-3">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="flex gap-1">
										{[...Array(4)].map((_, j) => (
											<div key={j} className="w-2 h-2 rounded-full bg-white/60"/>
										))}
									</div>
								))}
							</div>

							{/* Floating particles around card */}
							{index === 2 &&
								[...Array(8)].map((_, i) => {
									const angle = (i / 8) * Math.PI * 2;
									const radius = 120;
									const x = Math.cos(angle) * radius;
									const y = Math.sin(angle) * radius;

									return (
										<motion.div
											key={i}
											className="absolute w-1 h-1 rounded-full bg-green-400"
											style={{
												left: "50%",
												top: "50%",
												marginLeft: -2,
												marginTop: -2,
											}}
											animate={{
												x: [0, x, 0],
												y: [0, y, 0],
												opacity: [0, 1, 0],
											}}
											transition={{
												duration: 3,
												repeat: Infinity,
												delay: i * 0.2,
												ease: "easeInOut",
											}}/>
									);
								})}
						</div>
					</motion.div>
				))}
			</div>

			{/* Data flow lines */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none">
				<defs>
					<linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3"/>
						<stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0"/>
					</linearGradient>
				</defs>

				{[...Array(3)].map((_, i) => (
					<motion.circle
						key={i}
						cx="50%"
						cy="50%"
						r={40 + i * 30}
						fill="none"
						stroke="url(#cardGradient)"
						strokeWidth="2"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
						transition={{
							duration: 2,
							repeat: Infinity,
							delay: i * 0.4,
							ease: "easeInOut",
						}}/>
				))}
			</svg>
		</div>
	);
}


