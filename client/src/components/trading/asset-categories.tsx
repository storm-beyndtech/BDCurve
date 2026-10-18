import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export interface AssetCategory {
	id: string;
	name: string;
	description: string;
	icon: React.ElementType;
	stats: {
		available: string;
		volume24h: string;
		topGainer: string;
	};
	features: string[];
	color: "blue" | "purple" | "emerald" | "orange" | "amber";
	href: string;
}

export interface AssetCategoriesProps {
	categories: AssetCategory[];
	className?: string;
}

const colorConfig = {
	blue: {
		bg: "bg-blue-500/5",
		border: "border-blue-500/20",
		icon: "bg-blue-500/10 text-blue-600",
		badge: "bg-blue-500/10 text-blue-600",
	},
	purple: {
		bg: "bg-purple-500/5",
		border: "border-purple-500/20",
		icon: "bg-purple-500/10 text-purple-600",
		badge: "bg-purple-500/10 text-purple-600",
	},
	emerald: {
		bg: "bg-emerald-500/5",
		border: "border-emerald-500/20",
		icon: "bg-emerald-500/10 text-emerald-600",
		badge: "bg-emerald-500/10 text-emerald-600",
	},
	orange: {
		bg: "bg-orange-500/5",
		border: "border-orange-500/20",
		icon: "bg-orange-500/10 text-orange-600",
		badge: "bg-orange-500/10 text-orange-600",
	},
	amber: {
		bg: "bg-amber-500/5",
		border: "border-amber-500/20",
		icon: "bg-amber-500/10 text-amber-600",
		badge: "bg-amber-500/10 text-amber-600",
	},
};

export function AssetCategories({ categories, className }: AssetCategoriesProps) {
	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
			{categories.map((category) => {
				const Icon = category.icon;
				const colors = colorConfig[category.color];

				return (
					<Card
						key={category.id}
						variant="elevated"
						padding="lg"
						className="relative overflow-hidden group hover:shadow-depth-lg transition-all"
					>
						{/* Background Gradient */}
						<div className={cn("absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10", colors.bg)} />

						<div className="relative space-y-4">
							{/* Header */}
							<div className="flex items-start justify-between">
								<div className={cn(
									"w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
									colors.icon
								)}>
									<Icon className="h-7 w-7" />
								</div>
								<Badge className={colors.badge}>
									{category.stats.available}
								</Badge>
							</div>

							{/* Title & Description */}
							<div>
								<h3 className="text-xl font-semibold mb-2">{category.name}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{category.description}
								</p>
							</div>

							{/* Stats Grid */}
							<div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border">
								<div>
									<p className="text-xs text-muted-foreground mb-1">24h Volume</p>
									<p className="text-sm font-semibold">{category.stats.volume24h}</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">Top Gainer</p>
									<p className="text-sm font-semibold text-green-600 flex items-center gap-1">
										<TrendingUp className="h-3 w-3" />
										{category.stats.topGainer}
									</p>
								</div>
							</div>

							{/* Features List */}
							<ul className="space-y-2">
								{category.features.map((feature, index) => (
									<li key={index} className="flex items-start gap-2 text-sm">
										<div className="w-1 h-1 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
										<span className="text-muted-foreground">{feature}</span>
									</li>
								))}
							</ul>

							{/* CTA Button */}
							<Button
								variant="outline"
								className="w-full gap-2 group-hover:bg-primary-500 group-hover:text-primary-foreground transition-colors"
								asChild
							>
								<Link to={category.href}>
									<span>Explore {category.name}</span>
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
