import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, PieChart } from "lucide-react";

const assets = [
	{ symbol: "AAPL", shares: 150, value: "$26,768", color: "from-blue-500 to-blue-600", rotation: 0 },
	{ symbol: "MSFT", shares: 75, value: "$30,960", color: "from-purple-500 to-purple-600", rotation: 8 },
	{ symbol: "NVDA", shares: 25, value: "$21,880", color: "from-green-500 to-green-600", rotation: -5 },
	{ symbol: "AMZN", shares: 100, value: "$17,895", color: "from-orange-500 to-orange-600", rotation: 12 },
];

export function PortfolioVisual() {
	return (
		<div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
			{/* Background Glow */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5" />

			{/* Central Stats Card */}
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.8, delay: 0.2 }}
				className="relative z-10 px-8 py-6 bg-card/90 backdrop-blur-md border-2 border-primary-500/30 rounded-2xl shadow-depth-lg"
			>
				<div className="flex items-center gap-3 mb-4">
					<div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
						<PieChart className="h-6 w-6 text-primary-600" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Total Portfolio Value</p>
						<p className="text-3xl font-bold">$47,825.92</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg">
						<TrendingUp className="h-4 w-4 text-green-600" />
						<span className="text-sm font-semibold text-green-600">+7.28%</span>
					</div>
					<div className="flex items-center gap-2 px-3 py-1.5 bg-accent-500/10 rounded-lg">
						<DollarSign className="h-4 w-4 text-accent-600" />
						<span className="text-sm font-semibold text-accent-600">+$3,247</span>
					</div>
				</div>
			</motion.div>

			{/* Floating Asset Cards */}
			{assets.map((asset, index) => (
				<motion.div
					key={asset.symbol}
					initial={{ opacity: 0, y: 50, rotate: 0 }}
					animate={{
						opacity: 1,
						y: 0,
						rotate: asset.rotation,
					}}
					transition={{
						duration: 0.8,
						delay: 0.4 + index * 0.1,
						type: "spring",
						stiffness: 100,
					}}
					whileHover={{
						scale: 1.05,
						rotate: 0,
						zIndex: 50,
					}}
					className="absolute w-48 px-5 py-4 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-depth cursor-pointer"
					style={{
						top: `${20 + (index % 2) * 50}%`,
						left: `${15 + index * 18}%`,
					}}
				>
					<div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${asset.color} rounded-t-xl`} />
					<div className="space-y-2 mt-2">
						<div className="flex items-center justify-between">
							<p className="text-lg font-bold">{asset.symbol}</p>
							<div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${asset.color} opacity-20`} />
						</div>
						<div>
							<p className="text-xs text-muted-foreground">{asset.shares} shares</p>
							<p className="text-xl font-semibold">{asset.value}</p>
						</div>
					</div>
				</motion.div>
			))}

			{/* Connecting Lines */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
				<motion.line
					x1="50%"
					y1="50%"
					x2="20%"
					y2="25%"
					stroke="url(#lineGradient1)"
					strokeWidth="2"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1, delay: 0.8 }}
				/>
				<motion.line
					x1="50%"
					y1="50%"
					x2="40%"
					y2="75%"
					stroke="url(#lineGradient2)"
					strokeWidth="2"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1, delay: 0.9 }}
				/>
				<motion.line
					x1="50%"
					y1="50%"
					x2="60%"
					y2="25%"
					stroke="url(#lineGradient3)"
					strokeWidth="2"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1, delay: 1.0 }}
				/>
				<motion.line
					x1="50%"
					y1="50%"
					x2="80%"
					y2="75%"
					stroke="url(#lineGradient4)"
					strokeWidth="2"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1, delay: 1.1 }}
				/>
				<defs>
					<linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#3b82f6" />
						<stop offset="100%" stopColor="#60a5fa" />
					</linearGradient>
					<linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#a855f7" />
						<stop offset="100%" stopColor="#c084fc" />
					</linearGradient>
					<linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#10b981" />
						<stop offset="100%" stopColor="#34d399" />
					</linearGradient>
					<linearGradient id="lineGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#f97316" />
						<stop offset="100%" stopColor="#fb923c" />
					</linearGradient>
				</defs>
			</svg>
		</div>
	);
}
