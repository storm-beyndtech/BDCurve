import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { productList } from "@/lib/products";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductGridProps {
	/**
	 * Filter products by color
	 */
	filterByColor?: "primary" | "accent";
	/**
	 * Show CTA button on each card
	 * @default true
	 */
	showCTA?: boolean;
	/**
	 * Card variant
	 * @default "elevated"
	 */
	variant?: "elevated" | "glass" | "default";
}

export function ProductGrid({ filterByColor, showCTA = true, variant = "elevated" }: ProductGridProps) {
	const filteredProducts = filterByColor ? productList.filter((p) => p.color === filterByColor) : productList;

	return (
		<div className="flex flex-wrap justify-center gap-8 mt-8">
			{filteredProducts.map((product, i) => {
				const Icon = product.icon;

				return (
					<Card
						key={product.id}
						variant={variant}
						hover="lift"
						className={`w-full ${i === 3 || i === 4 ? "sm:max-w-[calc(50%-16px)]" : "sm:max-w-[calc(31%)]"} group relative overflow-hidden flex flex-col border border-border/50`}
					>
						<CardHeader className="space-y-3 relative z-10 pb-3">
							<div className="flex items-start justify-center gap-3">
								<div className="flex-1 min-w-0">
									<CardTitle className="text-lg group-hover:text-primary-600 transition-colors leading-tight">
										{product.name}
									</CardTitle>
								</div>

								<div
									className={cn(
										"flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0",
										product.color === "primary"
											? "bg-primary-500/10 text-primary-600"
											: "bg-primary-500/10 text-primary-600",
									)}
								>
									<Icon className="h-5 w-5" strokeWidth={1.5} />
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-4 pt-0 relative z-10 flex-1 flex flex-col">
							{/* Feature List */}
							<ul className="space-y-2 flex-1">
								{product.features.slice(0, 3).map((feature, index) => (
									<li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
										<span
											className={cn(
												"flex-shrink-0 font-bold leading-none mt-1",
												product.color === "primary" ? "text-primary-500" : "text-primary-500",
											)}
										>
											â—
										</span>
										<span className="leading-relaxed">{feature}</span>
									</li>
								))}
							</ul>

							{showCTA && (
								<Link to={product.href} className="block pt-2 mt-auto">
									<Button
										variant="ghost"
										className="w-full justify-between group/btn px-0 hover:bg-transparent hover:text-primary-600"
									>
										<span className="text-sm font-semibold">Learn more</span>
										<ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
									</Button>
								</Link>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
