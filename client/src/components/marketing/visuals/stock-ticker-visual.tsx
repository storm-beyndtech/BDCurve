import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const stocks = [
	{ symbol: "AAPL", price: "178.45", change: "+2.34%", positive: true },
	{ symbol: "MSFT", price: "412.80", change: "+1.85%", positive: true },
	{ symbol: "TSLA", price: "245.30", change: "-3.42%", positive: false },
	{ symbol: "NVDA", price: "875.20", change: "+5.67%", positive: true },
	{ symbol: "AMZN", price: "178.95", change: "+1.23%", positive: true },
	{ symbol: "GOOGL", price: "142.55", change: "+0.87%", positive: true },
	{ symbol: "META", price: "485.30", change: "-1.12%", positive: false },
	{ symbol: "BTC", price: "42,850", change: "+2.99%", positive: true },
];

export function StockTickerVisual() {
	return (
		<div className="relative w-full h-[400px] overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border">
			{/* Background Grid */}
			<div className="absolute inset-0 bg-grid-pattern opacity-5" />

			{/* Ticker Rows */}
			<div className="relative h-full flex flex-col justify-center gap-4 p-8">
				{[0, 1, 2].map((rowIndex) => (
					<div key={rowIndex} className="relative overflow-hidden">
						<motion.div
							animate={{
								x: rowIndex % 2 === 0 ? ["0%", "-50%"] : ["-50%", "0%"],
							}}
							transition={{
								duration: 20 + rowIndex * 5,
								repeat: Infinity,
								ease: "linear",
							}}
							className="flex gap-4 whitespace-nowrap"
						>
							{/* Duplicate stocks for seamless loop */}
							{[...stocks, ...stocks].map((stock, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.1 }}
									className="flex items-center gap-4 px-6 py-4 bg-card/80 backdrop-blur-sm border border-border rounded-xl shadow-depth min-w-[240px]"
								>
									{/* Symbol */}
									<div className="flex-1">
										<p className="text-lg font-bold">{stock.symbol}</p>
										<p className="text-2xl font-semibold">${stock.price}</p>
									</div>

									{/* Change */}
									<div className={`flex items-center gap-1 ${stock.positive ? "text-green-600" : "text-red-600"}`}>
										{stock.positive ? (
											<TrendingUp className="h-5 w-5" />
										) : (
											<TrendingDown className="h-5 w-5" />
										)}
										<span className="text-sm font-semibold">{stock.change}</span>
									</div>
								</motion.div>
							))}
						</motion.div>
					</div>
				))}
			</div>

			{/* Gradient Overlays */}
			<div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-card to-transparent pointer-events-none" />
			<div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-card to-transparent pointer-events-none" />

			{/* Floating Stats */}
			<div className="absolute top-4 right-4 flex flex-col gap-2">
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="px-4 py-2 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg"
				>
					<p className="text-xs text-muted-foreground">24h Volume</p>
					<p className="text-lg font-bold text-green-600">$45.2M</p>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.7 }}
					className="px-4 py-2 bg-primary-500/10 backdrop-blur-sm border border-primary-500/30 rounded-lg"
				>
					<p className="text-xs text-muted-foreground">Active Trades</p>
					<p className="text-lg font-bold text-primary-600">3,247</p>
				</motion.div>
			</div>
		</div>
	);
}
