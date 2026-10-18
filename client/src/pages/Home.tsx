import {
	HeroOverkill,
	ProductGrid,
	TrustedByMarquee,
	CustomerReviewsMarquee,
	FAQSection,
	SupportCTA,
	UseCaseSection,
	ContentImageSection,
	GlobalCoverageMap,
	PlatformCapabilities,
	MapStatsSection,
	FeatureCardMarquee,
	type FAQ,
} from "@/components/marketing";
import {
	MarketOverview,
	TrendingAssets,
	ProductHighlights,
	AssetCategories,
	defaultProductHighlights,
	type MarketIndex,
	type TrendingAsset,
	type AssetCategory,
} from "@/components/trading";
import {
	Shield,
	Clock,
	Lock,
	DollarSign,
	TrendingUp,
	Zap,
	Bitcoin,
	BarChart3,
	Coins,
	PieChart,
	Wallet,
} from "lucide-react";
import cryptoAsset from "@/assets/crypto.png";
import multiCurrencyAsset from "@/assets/fx.svg";

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

const mockAssetCategories: AssetCategory[] = [
	{
		id: "stocks",
		name: "Stocks",
		description: "Trade 9,000+ US-listed stocks commission-free with fractional shares starting at $1.",
		icon: TrendingUp,
		stats: {
			available: "9,000+",
			volume24h: "$45.2M",
			topGainer: "+8.4%",
		},
		features: ["Commission-free trading", "Fractional shares from $1", "Real-time market data"],
		color: "blue",
		href: "/products/stocks",
	},
	{
		id: "crypto",
		name: "Cryptocurrency",
		description: "Trade 40+ cryptocurrencies 24/7 with true ownership and no transfer fees.",
		icon: Bitcoin,
		stats: {
			available: "40+",
			volume24h: "$28.3M",
			topGainer: "+5.7%",
		},
		features: ["24/7 trading", "Staking rewards", "Cold storage security"],
		color: "purple",
		href: "/products/crypto",
	},
	{
		id: "etfs",
		name: "ETFs",
		description: "Diversify with 400+ commission-free ETFs across sectors and strategies.",
		icon: PieChart,
		stats: {
			available: "400+",
			volume24h: "$12.8M",
			topGainer: "+2.1%",
		},
		features: ["Zero commissions", "Sector & thematic ETFs", "Instant diversification"],
		color: "emerald",
		href: "/products/etfs",
	},
	{
		id: "options",
		name: "Options",
		description: "Advanced options trading with rebates. Earn $0.06-$0.18 per contract.",
		icon: BarChart3,
		stats: {
			available: "5,000+",
			volume24h: "$8.5M",
			topGainer: "+12.3%",
		},
		features: ["Earn rebates per contract", "Multi-leg strategies", "Advanced analytics"],
		color: "orange",
		href: "/products/options",
	},
	{
		id: "commodities",
		name: "Commodities",
		description: "Trade gold, silver, oil, and more through commission-free commodity ETFs.",
		icon: Coins,
		stats: {
			available: "50+",
			volume24h: "$3.2M",
			topGainer: "+1.8%",
		},
		features: ["Precious metals", "Energy commodities", "Agricultural futures"],
		color: "amber",
		href: "/products/commodities",
	},
	{
		id: "etfs",
		name: "ETFs",
		description: "Commission-free ETF trading with access to thousands of funds across all sectors.",
		icon: Wallet,
		stats: {
			available: "2,000+",
			volume24h: "$5.7M",
			topGainer: "+3.2%",
		},
		features: ["Zero commissions", "Diversified portfolios", "Fractional shares available"],
		color: "blue",
		href: "/products/etfs",
	},
];

// Use cases for the homepage - trading platform
const useCases = [
	{
		title: "Long-Term Wealth Building",
		description:
			"Build a diversified portfolio of stocks, ETFs, and index funds for long-term growth. Invest with fractional shares starting at just $1.",
		benefits: [
			"Commission-free stock and ETF trading",
			"Fractional shares - own expensive stocks for $1",
			"Automatic dividend reinvestment",
		],
	},
	{
		title: "Active Trading & Options",
		description:
			"Trade options with rebates and access advanced strategies. Execute multi-leg trades with professional-grade tools.",
		benefits: [
			"Earn $0.06-$0.18 per options contract",
			"Advanced strategy builder and analytics",
			"Extended-hours trading (4AM-8PM ET)",
		],
	},
	{
		title: "Crypto & Alternative Assets",
		description:
			"Trade 40+ cryptocurrencies 24/7 with true ownership. Diversify with commodities like gold, silver, and oil.",
		benefits: [
			"24/7 crypto trading with no transfer fees",
			"Staking rewards on ETH and SOL",
			"Commission-free commodity ETFs",
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

export default function HomePage() {
	return (
		<>
			{/* Hero Section */}
			<HeroOverkill />

			{/* Trusted By Marquee */}
			<div className="sm:py-20">
				<TrustedByMarquee />
			</div>

			{/* Market Overview - Live Data */}
			<section className="section-spacing-sm w-full">
				<div className="container-wide container-padding">
					<MarketOverview indices={mockMarketIndices} cryptos={mockCryptos} />
				</div>
			</section>

			{/* Products Grid */}
			<section className="section-spacing-sm bg-ambient-marketing-section w-full relative">
				<div className="container-wide container-padding relative z-10">
					<ProductGrid variant="glass" showCTA />
				</div>
			</section>

			{/* Map Stats Section - Updated for trading */}
			<MapStatsSection />

			{/* Product Highlights */}
			<section className="section-spacing-sm w-full">
				<div className="container-wide container-padding">
					<div className="mb-12 text-center">
						<h2 className="text-display-md font-bold mb-4">Why traders choose us</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Industry-leading features designed for serious investors
						</p>
					</div>
					<ProductHighlights highlights={defaultProductHighlights} />
				</div>
			</section>

			{/* Asset Categories */}
			<section className="section-spacing-sm bg-ambient-marketing-section w-full relative">
				<div className="container-wide container-padding relative z-10">
					<div className="mb-12 text-center">
						<h2 className="text-display-md font-bold mb-4">Invest in what matters to you</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Access thousands of assets across multiple markets
						</p>
					</div>
					<AssetCategories categories={mockAssetCategories} />
				</div>
			</section>

			{/* Use Cases Section */}
			<section className="section-spacing-sm bg-ambient-marketing-section w-full relative">
				<div className="container-wide container-padding relative z-10">
					<div className="mb-12">
						<h2 className="text-2xl mb-4 font-mono">INVESTMENT STRATEGIES</h2>
					</div>

					<UseCaseSection useCases={useCases} variant="glass" />
				</div>
			</section>

			{/* Stocks & ETFs Section */}
			<ContentImageSection
				title="Trade 9,000+ stocks commission-free"
				description="Access the full universe of US-listed stocks with zero commissions. From blue-chip companies to emerging growth stocks, build your portfolio with fractional shares and AI-powered insights."
				features={[
					"Commission-free stock trading",
					"Fractional shares starting at $1",
					"AI-powered stock analysis with Alpha",
					"Real-time market data and alerts",
				]}
				imagePosition="left"
				imagePlaceholder={{
					width: 800,
					height: 600,
					alt: "Stock trading dashboard",
					src: multiCurrencyAsset,
				}}
				cta={{
					label: "Explore stocks",
					href: "/products/stocks",
				}}
				variant="elevated"
			/>

			{/* Crypto & Options Section */}
			<ContentImageSection
				title="Trade crypto 24/7 and earn options rebates"
				description="Access 40+ cryptocurrencies with true ownership and no transfer fees. Trade Bitcoin, Ethereum, Solana, and more around the clock. Plus, earn rebates on every options contract you trade."
				description2="Advanced options trading with unique rebate program. Execute multi-leg strategies, hedge your portfolio, or generate income with covered calls. Our strategy builder makes complex trades simple."
				features={[
					"40+ cryptocurrencies available 24/7",
					"Earn $0.06-$0.18 per options contract",
					"Staking rewards on ETH and SOL",
					"Advanced options strategy builder",
				]}
				imagePosition="right"
				imagePlaceholder={{
					width: 800,
					height: 600,
					alt: "Crypto and options dashboard",
					src: cryptoAsset,
				}}
				cta={{
					label: "Trade crypto",
					href: "/products/crypto",
				}}
				variant="default"
			/>

			{/* Platform Capabilities */}
			<PlatformCapabilities />

			{/* Trending Assets */}
			<section className="section-spacing-sm w-full">
				<div className="container-wide container-padding">
					<TrendingAssets assets={mockTrendingAssets} />
				</div>
			</section>

			{/* Features Marquee */}
			<section className="section-spacing-md w-full relative overflow-hidden">
				<div className="mb-12 text-center">
					<h2 className="text-display-md font-bold mb-4">Trade Smarter</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Professional tools, real-time data, and AI-powered insights
					</p>
				</div>
				<FeatureCardMarquee
					features={[
						{ text: "Commission-free stocks & ETFs", color: "primary" },
						{ text: "Options rebates $0.06-$0.18/contract", color: "accent" },
						{ text: "24/7 crypto trading", color: "primary" },
						{ text: "AI-powered Alpha insights", color: "accent" },
						{ text: "Extended hours 4AM-8PM ET", color: "primary" },
						{ text: "Fractional shares from $1", color: "accent" },
						{ text: "Real-time market data", color: "primary" },
						{ text: "Advanced charting tools", color: "accent" },
						{ text: "Instant deposits", color: "primary" },
						{ text: "FINRA & SIPC protected", color: "accent" },
					]}
					duration={40}
					variant="glass"
				/>
			</section>

			{/* Security & Trust Strip */}
			<section className="section-spacing-md bg-muted/30 border-y border-border w-full relative">
				<div className="container-wide container-padding relative z-10">
					<div className="text-center mb-12">
						<h2 className="text-display-md mb-4">Trusted and secure</h2>
						<p className="text-lg text-muted-foreground/90 max-w-2xl mx-auto font-medium">
							Bank-level security with regulatory compliance built in
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{[
							{
								icon: Shield,
								title: "FINRA & SIPC",
								description: "$500K SIPC protection",
							},
							{
								icon: Lock,
								title: "Bank-Level Security",
								description: "256-bit encryption",
							},
							{
								icon: TrendingUp,
								title: "99.994% Uptime",
								description: "Reliable platform (2024)",
							},
							{
								icon: Zap,
								title: "24/7 Support",
								description: "US-based team",
							},
						].map((item, index) => (
							<div
								key={index}
								className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border shadow-depth"
							>
								<div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
									<item.icon className="h-7 w-7 text-primary-600" />
								</div>
								<h3 className="text-lg font-semibold mb-2">{item.title}</h3>
								<p className="text-sm text-muted-foreground">{item.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Customer Reviews Marquee */}
			<CustomerReviewsMarquee />

			{/* FAQ Section */}
			<FAQSection title="Frequently asked questions" faqs={faqs} columns={1} />

			{/* Final CTA */}
			<section className="section-spacing-lg w-full">
				<div className="container-wide container-padding">
					<SupportCTA variant="glass" showAllOptions={false} />
				</div>
			</section>
		</>
	);
}
