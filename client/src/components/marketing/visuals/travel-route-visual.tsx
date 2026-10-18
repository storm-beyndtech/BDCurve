import * as React from "react";
import { motion } from "framer-motion";

export function TravelRouteVisual() {
	// Major travel destinations with deterministic positions
	const destinations = [
		{ city: "NYC", x: 25, y: 35, delay: 0, color: "from-blue-500 to-cyan-600" },
		{ city: "LON", x: 50, y: 25, delay: 0.2, color: "from-purple-500 to-violet-600" },
		{ city: "TOK", x: 75, y: 40, delay: 0.4, color: "from-pink-500 to-rose-600" },
		{ city: "DXB", x: 60, y: 50, delay: 0.6, color: "from-orange-500 to-amber-600" },
		{ city: "SYD", x: 80, y: 70, delay: 0.8, color: "from-green-500 to-emerald-600" },
		{ city: "SFO", x: 15, y: 45, delay: 1, color: "from-indigo-500 to-blue-600" },
	];

	// Flight paths connecting cities
	const routes = [
		{ from: 0, to: 1, curve: 15 }, // NYC to LON
		{ from: 1, to: 2, curve: 20 }, // LON to TOK
		{ from: 2, to: 4, curve: -15 }, // TOK to SYD
		{ from: 0, to: 5, curve: -10 }, // NYC to SFO
		{ from: 5, to: 2, curve: 25 }, // SFO to TOK
		{ from: 1, to: 3, curve: 12 }, // LON to DXB
	];

	// Floating travel icons
	const travelIcons = [...Array(6)].map((_, i) => ({
		x: 20 + ((i * 41) % 60),
		y: 25 + ((i * 37) % 50),
		rotation: ((i * 29) % 360),
		duration: 5 + ((i * 13) % 30) / 10,
		delay: i * 0.3,
	}));

	return (
		<div className="relative w-full h-full flex items-center justify-center overflow-hidden">
			{/* World map subtle background */}
			<div className="absolute inset-0 opacity-5">
				<svg viewBox="0 0 100 100" className="w-full h-full">
					{/* Simplified world continents outline */}
					<path
						d="M 20 30 Q 30 25, 40 30 L 45 40 Q 50 45, 55 40 L 60 35 L 70 38 Q 75 42, 70 48 L 65 55 Q 60 60, 55 58 L 50 55 Q 45 52, 40 55 L 35 60 Q 30 65, 25 62 L 20 55 Q 15 50, 18 45 Z"
						fill="currentColor"
						className="text-green-500"/>
				</svg>
			</div>

			{/* Ambient glow */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-500/20 to-blue-500/10 rounded-full blur-3xl"
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.3, 0.5, 0.3],
				}}
				transition={{
					duration: 6,
					repeat: Infinity,
					ease: "easeInOut",
				}}/>

			{/* Flight route paths */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none">
				<defs>
					<linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="rgba(34, 197, 94, 0)"/>
						<stop offset="50%" stopColor="rgba(34, 197, 94, 0.6)"/>
						<stop offset="100%" stopColor="rgba(34, 197, 94, 0)"/>
					</linearGradient>
				</defs>

				{routes.map((route, i) => {
					const from = destinations[route.from];
					const to = destinations[route.to];
					const midX = (from.x + to.x) / 2;
					const midY = ((from.y + to.y) / 2) - route.curve;

					return (
						<g key={i}>
							{/* Route path */}
							<motion.path
								d={`M ${from.x}% ${from.y}% Q ${midX}% ${midY}%, ${to.x}% ${to.y}%`}
								fill="none"
								stroke="url(#routeGradient)"
								strokeWidth="2"
								strokeDasharray="4 4"
								initial={{ pathLength: 0, opacity: 0 }}
								animate={{
									pathLength: [0, 1],
									opacity: [0, 0.6, 0],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									delay: i * 0.5,
									ease: "easeInOut",
								}}/>
						</g>
					);
				})}
			</svg>

			{/* Animated planes traveling routes */}
			{routes.map((route, i) => {
				const from = destinations[route.from];
				const to = destinations[route.to];
				const midX = (from.x + to.x) / 2;
				const midY = ((from.y + to.y) / 2) - route.curve;

				return (
					<motion.div
						key={i}
						className="absolute"
						initial={{ offsetDistance: "0%" }}
						animate={{
							offsetDistance: ["0%", "100%"],
						}}
						transition={{
							duration: 5,
							repeat: Infinity,
							delay: i * 0.7,
							ease: "linear",
						}}
						style={{
							offsetPath: `path('M ${from.x} ${from.y} Q ${midX} ${midY}, ${to.x} ${to.y}')`,
							offsetRotate: "auto",
						}}
					>
						<motion.div
							className="w-6 h-6 text-green-500"
							animate={{
								opacity: [0, 1, 1, 0],
								scale: [0, 1, 1, 0],
							}}
							transition={{
								duration: 5,
								repeat: Infinity,
								delay: i * 0.7,
								ease: "easeInOut",
							}}
						>
							<svg fill="currentColor" viewBox="0 0 24 24">
								<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
							</svg>
						</motion.div>
					</motion.div>
				);
			})}

			{/* Destination city nodes */}
			{destinations.map((dest, i) => (
				<motion.div
					key={dest.city}
					className="absolute z-10"
					style={{
						left: `${dest.x}%`,
						top: `${dest.y}%`,
						transform: "translate(-50%, -50%)",
					}}
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						duration: 0.6,
						delay: dest.delay,
						ease: "easeOut",
					}}
				>
					{/* City marker */}
					<motion.div
						className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${dest.color} shadow-lg flex flex-col items-center justify-center border border-white/20`}
						animate={{
							boxShadow: [
								"0 4px 20px rgba(0, 0, 0, 0.1)",
								"0 8px 30px rgba(34, 197, 94, 0.3)",
								"0 4px 20px rgba(0, 0, 0, 0.1)",
							],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
							delay: dest.delay,
						}}
					>
						<span className="text-xs font-bold text-white">{dest.city}</span>
						<div className="w-2 h-2 rounded-full bg-white mt-1"/>
					</motion.div>

					{/* Pulse ring */}
					<motion.div
						className="absolute inset-0 rounded-2xl border-2 border-green-400"
						animate={{
							scale: [1, 1.6],
							opacity: [0.6, 0],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeOut",
							delay: dest.delay,
						}}/>
				</motion.div>
			))}

			{/* Floating travel icons */}
			{travelIcons.map((icon, i) => {
				// Different icon per index
				const icons = [
					// Luggage
					<svg key="luggage" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
						<path d="M17 6h-2V3a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H7a3 3 0 00-3 3v9a3 3 0 003 3h10a3 3 0 003-3V9a3 3 0 00-3-3zM11 3h2v3h-2V3zm7 15a1 1 0 01-1 1H7a1 1 0 01-1-1V9a1 1 0 011-1h10a1 1 0 011 1v9z"/>
					</svg>,
					// Passport
					<svg key="passport" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
						<path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6zm6 4a3 3 0 110 6 3 3 0 010-6zm0 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
					</svg>,
					// Location pin
					<svg key="pin" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
						<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
					</svg>,
					// Globe
					<svg key="globe" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
					</svg>,
					// Camera
					<svg key="camera" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
						<path d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9zm3 15a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/>
					</svg>,
					// Compass
					<svg key="compass" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.2 14.2L11 13l-3.2 5.2L13 11l3.2-5.2L11 13l5.2 3.2z"/>
					</svg>,
				];

				return (
					<motion.div
						key={i}
						className="absolute w-8 h-8 text-green-500/20"
						style={{
							left: `${icon.x}%`,
							top: `${icon.y}%`,
						}}
						animate={{
							y: [0, -20, 0],
							rotate: [icon.rotation, icon.rotation + 15, icon.rotation],
							opacity: [0.1, 0.3, 0.1],
						}}
						transition={{
							duration: icon.duration,
							repeat: Infinity,
							ease: "easeInOut",
							delay: icon.delay,
						}}
					>
						{icons[i % icons.length]}
					</motion.div>
				);
			})}

			{/* Floating particles representing travelers */}
			{[...Array(15)].map((_, i) => {
				const xPos = ((i * 43) % 90) + 5;
				const yPos = ((i * 37) % 90) + 5;
				const duration = 3 + ((i * 17) % 30) / 10;

				return (
					<motion.div
						key={i}
						className="absolute w-1.5 h-1.5 rounded-full bg-green-400/50"
						style={{
							left: `${xPos}%`,
							top: `${yPos}%`,
						}}
						animate={{
							opacity: [0, 1, 0],
							scale: [0, 1.2, 0],
						}}
						transition={{
							duration,
							repeat: Infinity,
							delay: i * 0.15,
							ease: "easeInOut",
						}}/>
				);
			})}

			{/* Transaction success indicators */}
			{destinations.map((dest, i) => {
				if (i % 2 === 0) {
					return (
						<motion.div
							key={`success-${i}`}
							className="absolute"
							style={{
								left: `${dest.x}%`,
								top: `${dest.y - 8}%`,
								transform: "translate(-50%, -50%)",
							}}
							initial={{ opacity: 0, y: 10 }}
							animate={{
								opacity: [0, 1, 0],
								y: [10, 0, -10],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								delay: dest.delay + 1,
								ease: "easeOut",
							}}
						>
							<div className="w-6 h-6 rounded-full bg-green-500/80 flex items-center justify-center">
								<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
								</svg>
							</div>
						</motion.div>
					);
				}
				return null;
			})}
		</div>
	);
}


