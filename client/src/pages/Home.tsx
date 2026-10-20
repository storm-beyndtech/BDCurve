import {
	HeroOverkill,
	ProductGrid,
	FAQSection,
	SupportCTA,
	ContentImageSection,
	MapStatsSection,
	TrustedByMarquee,
	CopyTradersMarquee,
	CustomerReviewsMarquee,
	type FAQ,
} from "@/components/marketing";
import {
	MarketOverview,
	TrendingAssets,
	type MarketIndex,
	type TrendingAsset,
} from "@/components/trading";
import { Shield, Lock, Layers, Zap } from "lucide-react";
import multiCurrencyAsset from "@/assets/fx.svg";
import cryptoAsset from "@/assets/crypto.png";
// Mock market data
const mockMarketIndices: MarketIndex[] = [
	{ symbol: "S&P 500", name: "Standard & Poor's 500", price: 4783.45, change: 23.12, changePercent: 0.49 },
	{ symbol: "NASDAQ", name: "NASDAQ Composite", price: 14968.78, change: -45.67, changePercent: -0.3 },
	{ symbol: "DOW", name: "Dow Jones Industrial", price: 37248.35, change: 118.34, changePercent: 0.32 },
	{ symbol: "Russell 2000", name: "Small Cap Index", price: 2045.21, change: 8.92, changePercent: 0.44 },
];

const mockCryptos: MarketIndex[] = [
	{ symbol: "BTC", name: "Bitcoin", price: 42850.0, change: 1245.5, changePercent: 2.99 },
	{ symbol: "ETH", name: "Ethereum", price: 2245.8, change: -32.1, changePercent: -1.41 },
	{ symbol: "SOL", name: "Solana", price: 98.45, change: 5.23, changePercent: 5.61 },
	{ symbol: "ADA", name: "Cardano", price: 0.52, change: 0.02, changePercent: 4.0 },
];

const mockTrendingAssets: TrendingAsset[] = [
	{
		symbol: "NVDA",
		name: "NVIDIA Corporation",
		price: 875.2,
		changePercent: 8.45,
		volume: "$42.5B",
		category: "stocks",
		chartData: [
			{ value: 800 },
			{ value: 820 },
			{ value: 810 },
			{ value: 840 },
			{ value: 860 },
			{ value: 870 },
			{ value: 875.2 },
		],
	},
	{
		symbol: "BTC",
		name: "Bitcoin",
		price: 42850.0,
		changePercent: 5.67,
		volume: "$28.3B",
		category: "crypto",
		chartData: [
			{ value: 40500 },
			{ value: 41200 },
			{ value: 40800 },
			{ value: 41800 },
			{ value: 42100 },
			{ value: 42500 },
			{ value: 42850 },
		],
	},
	{
		symbol: "TSLA",
		name: "Tesla, Inc.",
		price: 245.3,
		changePercent: 4.23,
		volume: "$18.7B",
		category: "stocks",
		chartData: [
			{ value: 235 },
			{ value: 237 },
			{ value: 236 },
			{ value: 240 },
			{ value: 242 },
			{ value: 244 },
			{ value: 245.3 },
		],
	},
	{
		symbol: "ETH",
		name: "Ethereum",
		price: 2245.8,
		changePercent: 3.89,
		volume: "$15.2B",
		category: "crypto",
		chartData: [
			{ value: 2150 },
			{ value: 2170 },
			{ value: 2160 },
			{ value: 2190 },
			{ value: 2210 },
			{ value: 2230 },
			{ value: 2245.8 },
		],
	},
	{
		symbol: "QQQ",
		name: "Invesco QQQ Trust",
		price: 398.45,
		changePercent: 2.12,
		volume: "$9.8B",
		category: "etf",
		chartData: [
			{ value: 390 },
			{ value: 392 },
			{ value: 391 },
			{ value: 395 },
			{ value: 396 },
			{ value: 397 },
			{ value: 398.45 },
		],
	},
];

// FAQs for the homepage - trading platform
const faqs: FAQ[] = [
	{
		question: "Is my money safe with Bounding Curve?",
		answer:
			"Yes. We're a FINRA and SIPC member, providing up to $500,000 in SIPC protection. Cash accounts are FDIC insured up to $5 million. We use bank-level security with AES 256-bit encryption and maintain 99.994% uptime.",
	},
	{
		question: "Are there really $0 commissions?",
		answer:
			"Yes! We offer commission-free trading on stocks, ETFs, and options. For options, we actually pay you rebates of $0.06-$0.18 per contract based on volume. The only fees are regulatory fees (required by SEC/FINRA).",
	},
	{
		question: "Can I trade after hours?",
		answer:
			"Yes. Premium and Concierge members get extended-hours trading from 4:00 AM to 8:00 PM ET. This allows you to react to earnings announcements and news outside regular market hours (9:30 AM - 4:00 PM ET).",
	},
	{
		question: "What's the minimum to get started?",
		answer:
			"There's no account minimum. You can start investing with as little as $1 using fractional shares. Buy portions of expensive stocks like Amazon or Google without needing thousands of dollars.",
	},
	{
		question: "How do I transfer my portfolio from another broker?",
		answer:
			"We make it easy! Use our automated transfer system to move your stocks, ETFs, options, and crypto from any broker. Plus, get a 1% uncapped match on your transferred portfolio value (transfer $100K, get $1K). No transfer fees.",
	},
	{
		question: "Do you support retirement accounts (IRAs)?",
		answer:
			"Yes! We offer Traditional and Roth IRAs with commission-free trading and a 1% match on annual contributions. Trade stocks, ETFs, and options strategies (covered calls, spreads) in your IRA for tax-advantaged investing.",
	},
];

/**
 * Landing page — intentionally restrained: one accent (primary blue) + neutrals, few sections,
 * minimal motion. Story: TradFi meets DeFi — equities and digital assets in one account.
 */
export default function HomePage() {
	return (
		<>
			{/* Hero: "Tradefi meets Defi" + live BTC chart */}
			<HeroOverkill />

			{/* Partners strip */}
			<TrustedByMarquee />

			{/* Markets snapshot: indices (TradFi) next to crypto (DeFi) */}
			<section className="section-spacing-sm w-full">
				<div className="container-wide container-padding">
					<MarketOverview indices={mockMarketIndices} cryptos={mockCryptos} />
				</div>
			</section>

			{/* Asset classes */}
			<section className="section-spacing-sm w-full border-y border-border bg-muted/20">
				<div className="container-wide container-padding">
					<ProductGrid variant="glass" showCTA />
				</div>
			</section>

			{/* The concept: one account for both worlds */}
			<ContentImageSection
				title="Stocks and crypto, one account"
				description="Hold blue-chip equities and ETFs alongside Bitcoin, Ethereum and leading on-chain assets. One balance, one dashboard, one consistent view of your portfolio across traditional and decentralised markets."
				features={[
					"US equities and ETFs next to 50+ digital assets",
					"Live market data and charts for every listed asset",
					"Unified balances in USDT",
					"Secure custody and verified accounts",
				]}
				imagePosition="left"
				imagePlaceholder={{
					width: 800,
					height: 600,
					alt: "Multi-asset trading dashboard",
					src: multiCurrencyAsset,
				}}
				cta={{ label: "Explore markets", href: "/products" }}
				variant="default"
			/>

			{/* Restored: crypto around the clock */}
			<ContentImageSection
				title="Digital assets, around the clock"
				description="Trade Bitcoin, Ethereum, Solana and 50+ leading tokens 24/7 with live pricing, then move between crypto and equities from the same USDT balance."
				features={[
					"24/7 crypto markets with live quotes",
					"Clear platform-wide minimums, no hidden tiers",
					"Copy experienced traders across asset classes",
					"Fast deposits and reviewed withdrawals",
				]}
				imagePosition="right"
				imagePlaceholder={{ width: 800, height: 600, alt: "Crypto trading dashboard", src: cryptoAsset }}
				cta={{ label: "Trade crypto", href: "/products/crypto" }}
				variant="default"
			/>

			{/* Copy traders */}
			<CopyTradersMarquee />

			{/* Trending (recharts sparklines) */}
			<section className="section-spacing-sm w-full">
				<div className="container-wide container-padding">
					<TrendingAssets assets={mockTrendingAssets} />
				</div>
			</section>

			{/* Global coverage */}
			<MapStatsSection />

			{/* Trust strip */}
			<section className="section-spacing-md w-full border-y border-border">
				<div className="container-wide container-padding">
					<div className="text-center mb-10">
						<h2 className="text-display-md mb-3">Built on trust</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Security and transparency across every market we support
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{ icon: Shield, title: "Verified accounts", description: "KYC on every account" },
							{ icon: Lock, title: "Encrypted by default", description: "256-bit encryption in transit and at rest" },
							{ icon: Layers, title: "Multi-asset", description: "Equities, ETFs and digital assets" },
							{ icon: Zap, title: "Always on", description: "Crypto markets 24/7" },
						].map((item) => (
							<div key={item.title} className="flex flex-col items-start p-5 rounded-xl border border-border bg-card">
								<item.icon className="h-5 w-5 text-primary-600 mb-3" />
								<h3 className="font-semibold mb-1">{item.title}</h3>
								<p className="text-sm text-muted-foreground">{item.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<CustomerReviewsMarquee />

			<FAQSection title="Frequently asked questions" faqs={faqs} columns={1} />

			<section className="section-spacing-lg w-full">
				<div className="container-wide container-padding">
					<SupportCTA variant="glass" showAllOptions={false} />
				</div>
			</section>
		</>
	);
}