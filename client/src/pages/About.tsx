import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BackgroundGrid, SubtleBlurOrbs } from "@/components/marketing/visuals";
import {
	MissionVisionSection,
	JourneyProgressSection,
	GlobalCoverageMap,
	ProductHeroOverkill,
} from "@/components/marketing";
import {
	ArrowRight,
	Users,
	Shield,
	Zap,
	TrendingUp,
	Target,
	Globe2,
	Sparkles,
	LineChart,
} from "lucide-react";
import aboutHeroAsset from "@/assets/finance-2.svg";

const values = [
	{
		icon: Target,
		title: "Investor First",
		description:
			"Every decision we make starts with how it benefits our investors. We build tools that empower serious investors to make better decisions and achieve their financial goals.",
	},
	{
		icon: Shield,
		title: "Security & Trust",
		description:
			"We're FINRA and SIPC regulated with bank-level security. Your assets are protected with 256-bit encryption, cold storage for crypto, and 99.994% platform uptime.",
	},
	{
		icon: Zap,
		title: "Innovation Matters",
		description:
			"From AI-powered insights to options rebates, we're constantly innovating to give you an edge. Advanced tools shouldn't be complicated—we make them accessible.",
	},
	{
		icon: TrendingUp,
		title: "Transparent Pricing",
		description:
			"No hidden fees, no surprises. Commission-free trading on stocks and ETFs, and we actually pay you rebates on options. You deserve to keep more of your returns.",
	},
];

const pillars = [
	{
		icon: Globe2,
		title: "Multi-asset platform",
		description:
			"Stocks, ETFs, options, crypto, and commodities—all in one place with unified research and analytics.",
	},
	{
		icon: LineChart,
		title: "AI-powered insights",
		description:
			"Alpha AI delivers real-time market analysis, stock insights, and earnings recaps so you can invest smarter.",
	},
	{
		icon: Sparkles,
		title: "Professional tools for everyone",
		description:
			"Advanced features like options strategy builder, extended hours trading, and API access—simple enough for beginners.",
	},
];

export default function AboutPage() {
	return (
		<div className="relative">
			{/* Hero Section */}
			<ProductHeroOverkill
				badge="ABOUT BOUNDING CURVE"
				badgeIcon={Globe2}
				headline="Investing for those who"
				headlineHighlight="take it seriously"
				subheadline="Bounding Curve combines cutting-edge technology with regulatory compliance to deliver commission-free trading, AI-powered insights, and professional-grade tools to millions of investors worldwide."
				primaryCTA={{
					label: "Start investing",
					href: "/signup",
				}}
				secondaryCTA={{
					label: "View open positions",
					href: "#careers",
				}}
				trustIndicators={[
					{ icon: Shield, text: "FINRA & SIPC Member" },
					{ icon: Globe2, text: "Millions of Investors" },
					{ icon: Users, text: "99.9% Uptime" },
				]}
				heroAsset={aboutHeroAsset}
				heroAssetClassName="dark:brightness-90"
				visualBackground="network"
				colorTheme="blue"
			/>

			{/* Stats Section */}
			<section className="section-spacing-md">
				<div className="container-wide container-padding">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						<Card variant="glass" padding="lg" className="text-center">
							<div className="space-y-2">
								<p className="text-4xl font-bold tracking-tight">$0</p>
								<p className="text-sm text-muted-foreground">Commissions on stocks & ETFs</p>
							</div>
						</Card>

						<Card variant="glass" padding="lg" className="text-center">
							<div className="space-y-2">
								<p className="text-4xl font-bold tracking-tight">9k+</p>
								<p className="text-sm text-muted-foreground">Stocks available to trade</p>
							</div>
						</Card>

						<Card variant="glass" padding="lg" className="text-center">
							<div className="space-y-2">
								<p className="text-4xl font-bold tracking-tight">40+</p>
								<p className="text-sm text-muted-foreground">Cryptocurrencies 24/7</p>
							</div>
						</Card>

						<Card variant="glass" padding="lg" className="text-center">
							<div className="space-y-2">
								<p className="text-4xl font-bold tracking-tight">99.9%</p>
								<p className="text-sm text-muted-foreground">Platform uptime (2024)</p>
							</div>
						</Card>
					</div>
				</div>
			</section>

			{/* Mission & Vision Section */}
			<MissionVisionSection />

			{/* Journey Timeline Section */}
			<JourneyProgressSection />

			{/* Values Section */}
			<section className="section-spacing-lg bg-muted/30">
				<div className="container-wide container-padding">
					<div className="max-w-5xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-display-md font-bold mb-4">Our values</h2>
							<p className="text-lg text-muted-foreground">The principles that guide everything we build</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{values.map((value, index) => {
								const Icon = value.icon;
								return (
									<Card key={index} variant="elevated" padding="lg" hover="lift">
										<div className="flex gap-4">
											<div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
												<Icon className="h-6 w-6 text-primary-600" />
											</div>
											<div className="space-y-2">
												<h3 className="font-bold text-lg">{value.title}</h3>
												<p className="text-sm text-muted-foreground">{value.description}</p>
											</div>
										</div>
									</Card>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="section-spacing-lg">
				<div className="container-wide container-padding">
					<Card variant="glass" padding="lg">
						<div className="max-w-3xl mx-auto text-center space-y-6">
							<h2 className="text-display-sm font-bold">
								Ready to start investing?
							</h2>
							<p className="text-lg text-muted-foreground">
								Join millions of investors using Bounding Curve for commission-free trading,
								AI-powered insights, and professional-grade tools.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link to="/signup">
									<Button size="lg" className="gap-2 group">
										Get started now
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
									</Button>
								</Link>
								<Link to="/contact">
									<Button size="lg" variant="outline">
										Contact us
									</Button>
								</Link>
							</div>
						</div>
					</Card>
				</div>
			</section>
		</div>
	);
}
