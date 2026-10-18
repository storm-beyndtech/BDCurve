import React from "react";
import { motion } from "framer-motion";
import { Bitcoin, TrendingUp } from "lucide-react";

const cryptos = [
	{ symbol: "BTC", name: "Bitcoin", price: "$42,850", change: "+2.99%", color: "from-orange-500 to-yellow-500", size: 80 },
	{ symbol: "ETH", name: "Ethereum", price: "$2,246", change: "-1.41%", color: "from-blue-500 to-purple-500", size: 64 },
	{ symbol: "SOL", name: "Solana", price: "$98.45", change: "+5.61%", color: "from-purple-500 to-pink-500", size: 56 },
	{ symbol: "ADA", name: "Cardano", price: "$0.52", change: "+4.00%", color: "from-blue-400 to-cyan-400", size: 48 },
];

export function CryptoVisual() {
	return (
		<div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted/30">
			{/* Animated Background Grid */}
			<div className="absolute inset-0">
				{[...Array(20)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-px h-full bg-primary-500/10"
						style={{ left: `${i * 5}%` }}
						animate={{
							opacity: [0.1, 0.3, 0.1],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							delay: i * 0.1,
						}}
					/>
				))}
			</div>

			{/* Central 24/7 Badge */}
			<motion.div
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
				className="relative z-20 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-500/30 rounded-full shadow-depth-lg"
			>
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
					<span className="text-sm font-semibold">24/7 Trading</span>
				</div>
			</motion.div>

			{/* Floating Crypto Coins */}
			{cryptos.map((crypto, index) => {
				const angle = (index * 90) - 45; // Distribute in a circle
				const radius = 150;
				const x = Math.cos((angle * Math.PI) / 180) * radius;
				const y = Math.sin((angle * Math.PI) / 180) * radius;

				return (
					<motion.div
						key={crypto.symbol}
						initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
						animate={{
							opacity: 1,
							scale: 1,
							x,
							y,
						}}
						transition={{
							duration: 1,
							delay: 0.5 + index * 0.15,
							type: "spring",
							stiffness: 80,
						}}
						whileHover={{
							scale: 1.1,
							zIndex: 50,
						}}
						className="absolute flex flex-col items-center gap-3 cursor-pointer group"
					>
						{/* Coin Circle */}
						<motion.div
							animate={{
								rotate: 360,
							}}
							transition={{
								duration: 20 + index * 5,
								repeat: Infinity,
								ease: "linear",
							}}
							className={`relative ${crypto.size === 80 ? 'w-20 h-20' : crypto.size === 64 ? 'w-16 h-16' : crypto.size === 56 ? 'w-14 h-14' : 'w-12 h-12'} rounded-full bg-gradient-to-br ${crypto.color} p-0.5 shadow-lg group-hover:shadow-2xl transition-shadow`}
						>
							<div className="w-full h-full rounded-full bg-card flex items-center justify-center">
								<span className="font-bold text-sm">{crypto.symbol}</span>
							</div>
						</motion.div>

						{/* Price Card */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1 + index * 0.1 }}
							className="px-3 py-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-depth min-w-[120px]"
						>
							<p className="text-xs text-muted-foreground text-center mb-1">{crypto.name}</p>
							<p className="text-sm font-bold text-center">{crypto.price}</p>
							<p className={`text-xs font-semibold text-center flex items-center justify-center gap-1 ${
								crypto.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
							}`}>
								{crypto.change.startsWith('+') && <TrendingUp className="h-3 w-3" />}
								{crypto.change}
							</p>
						</motion.div>
					</motion.div>
				);
			})}

			{/* Orbital Rings */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none">
				{[150, 200, 250].map((radius, index) => (
					<motion.circle
						key={radius}
						cx="50%"
						cy="50%"
						r={radius}
						fill="none"
						stroke="url(#orbitalGradient)"
						strokeWidth="1"
						strokeDasharray="10 5"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: 1, opacity: 0.2 }}
						transition={{
							duration: 2,
							delay: index * 0.3,
						}}
					/>
				))}
				<defs>
					<linearGradient id="orbitalGradient">
						<stop offset="0%" stopColor="#3b82f6" />
						<stop offset="50%" stopColor="#a855f7" />
						<stop offset="100%" stopColor="#3b82f6" />
					</linearGradient>
				</defs>
			</svg>

			{/* Stats Corner */}
			<motion.div
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6, delay: 1.5 }}
				className="absolute bottom-4 right-4 px-4 py-3 bg-card/90 backdrop-blur-sm border border-border rounded-xl shadow-depth"
			>
				<p className="text-xs text-muted-foreground mb-1">24h Crypto Volume</p>
				<p className="text-2xl font-bold text-purple-600">$28.3M</p>
			</motion.div>
		</div>
	);
}
