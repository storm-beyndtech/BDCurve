import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Percent, TrendingUp, Shield, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductHighlight {
	id: string;
	title: string;
	subtitle: string;
	value: string;
	description: string;
	icon: React.ElementType;
	color: "primary" | "accent" | "success" | "purple" | "orange";
	badge?: string;
}

export interface ProductHighlightsProps {
	highlights: ProductHighlight[];
	className?: string;
}

const colorConfig = {
	primary: {
		bg: "bg-primary-500/5",
		icon: "bg-primary-500/10 text-primary-600",
		text: "text-primary-600",
	},
	accent: {
		bg: "bg-accent-500/5",
		icon: "bg-accent-500/10 text-accent-600",
		text: "text-accent-600",
	},
	success: {
		bg: "bg-green-500/5",
		icon: "bg-green-500/10 text-green-600",
		text: "text-green-600",
	},
	purple: {
		bg: "bg-purple-500/5",
		icon: "bg-purple-500/10 text-purple-600",
		text: "text-purple-600",
	},
	orange: {
		bg: "bg-orange-500/5",
		icon: "bg-orange-500/10 text-orange-600",
		text: "text-orange-600",
	},
};

export function ProductHighlights({ highlights, className }: ProductHighlightsProps) {
	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
			{highlights.map((highlight) => {
				const Icon = highlight.icon;
				const colors = colorConfig[highlight.color];

				return (
					<Card
						key={highlight.id}
						variant="elevated"
						padding="lg"
						className="relative overflow-hidden group hover:shadow-depth-lg transition-all"
					>
						{/* Background Effect */}
						<div className={cn("absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20", colors.bg)} />

						<div className="relative space-y-4">
							{/* Icon & Badge */}
							<div className="flex items-start justify-between">
								<div className={cn(
									"w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
									colors.icon
								)}>
									<Icon className="h-7 w-7" />
								</div>
								{highlight.badge && (
									<Badge variant="default" className="text-xs">
										{highlight.badge}
									</Badge>
								)}
							</div>

							{/* Content */}
							<div className="space-y-2">
								<div>
									<p className="text-sm text-muted-foreground mb-1">{highlight.subtitle}</p>
									<h3 className="text-2xl font-bold tracking-tight">{highlight.title}</h3>
								</div>
								<div className={cn("text-3xl font-bold", colors.text)}>
									{highlight.value}
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{highlight.description}
								</p>
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}

// Default product highlights
export const defaultProductHighlights: ProductHighlight[] = [
	{
		id: "commission-free",
		title: "Commission-Free Trading",
		subtitle: "Stock & ETF Trades",
		value: "$0",
		description: "Trade thousands of stocks and ETFs with zero commissions. Keep more of your returns.",
		icon: DollarSign,
		color: "primary",
		badge: "Popular",
	},
	{
		id: "options-rebates",
		title: "Options Rebates",
		subtitle: "Earn Per Contract",
		value: "$0.06-$0.18",
		description: "We pay you to trade options. Get rebates on every contract based on your volume.",
		icon: Percent,
		color: "success",
		badge: "Exclusive",
	},
	{
		id: "crypto-trading",
		title: "24/7 Crypto Trading",
		subtitle: "Always-On Markets",
		value: "40+",
		description: "Trade cryptocurrencies around the clock with true ownership and no transfer fees.",
		icon: Zap,
		color: "purple",
	},
	{
		id: "fractional-shares",
		title: "Fractional Shares",
		subtitle: "Start Investing With",
		value: "$1",
		description: "Own expensive stocks for as little as $1. Build a diversified portfolio on any budget.",
		icon: TrendingUp,
		color: "accent",
		badge: "New",
	},
	{
		id: "margin-rates",
		title: "Low Margin Rates",
		subtitle: "As Low As",
		value: "3.95%",
		description: "Competitive margin rates for leveraged trading. Borrow at institutional-grade pricing.",
		icon: Percent,
		color: "orange",
	},
	{
		id: "sipc-protection",
		title: "SIPC Protected",
		subtitle: "Account Insurance",
		value: "$500K",
		description: "Your assets are protected up to $500,000 with SIPC. Plus, FDIC insurance on cash.",
		icon: Shield,
		color: "primary",
		badge: "Secure",
	},
];
