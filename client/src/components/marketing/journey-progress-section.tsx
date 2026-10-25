import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, TrendingUp } from "lucide-react";

interface JourneyMilestone {
	year: string;
	quarter?: string;
	title: string;
	description: string;
	metrics?: Array<{
		label: string;
		value: string;
	}>;
	status: "completed" | "current" | "upcoming";
}

const milestones: JourneyMilestone[] = [
	{
		year: "2019",
		quarter: "Q4",
		title: "Foundation",
		description:
			"Bounding Curve founded by fintech veterans from Stripe, PayPal, and TransferWise. First line of code written.",
		status: "completed",
	},
	{
		year: "2020",
		quarter: "Q2",
		title: "Product Launch",
		description: "Multi-currency accounts go live. First 100 businesses onboarded in 8 weeks.",
		metrics: [
			{ label: "Currencies", value: "15" },
			{ label: "Customers", value: "100" },
		],
		status: "completed",
	},
	{
		year: "2021",
		quarter: "Q1",
		title: "Card Issuing",
		description: "Launched virtual and physical card platform. Expanded to 50+ currencies.",
		metrics: [
			{ label: "Cards Issued", value: "10K" },
			{ label: "Countries", value: "89" },
		],
		status: "completed",
	},
	{
		year: "2022",
		quarter: "Q3",
		title: "Global Scale",
		description:
			"Opened Singapore and London offices. Crossed $500M in annual processing volume.",
		metrics: [
			{ label: "Volume", value: "$500M" },
			{ label: "Uptime", value: "99.99%" },
		],
		status: "completed",
	},
	{
		year: "2023",
		quarter: "Q2",
		title: "Enterprise Platform",
		description:
			"Developer APIs and treasury tools launched. 10,000+ active businesses, $2.4B annual volume.",
		metrics: [
			{ label: "Businesses", value: "10K+" },
			{ label: "Volume", value: "$2.4B" },
		],
		status: "completed",
	},
	{
		year: "2024",
		quarter: "Q4",
		title: "AI & Innovation",
		description:
			"Real-time fraud detection with AI. Instant FX optimization. Expanding to emerging markets.",
		status: "current",
	},
	{
		year: "2025",
		quarter: "Q1",
		title: "Next Frontier",
		description: "Crypto on-ramps, embedded finance SDKs, and advanced treasury automation.",
		status: "upcoming",
	},
];

export function JourneyProgressSection() {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start center", "end center"],
	});

	const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

	return (
		<section ref={containerRef} className="section-spacing-lg bg-muted/20 relative overflow-hidden">
			{/* Decorative Grid */}
			<div className="absolute inset-0 opacity-30 pointer-events-none">
				<div
					className="h-full w-full"
					style={{
						backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(to right, var(--border) 1px, transparent 1px)`,
						backgroundSize: "80px 80px",
					}}/>
			</div>

			<div className="container-wide container-padding relative">
				<motion.div
					className="mb-16 w-full"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-6">
						<h2 className="text-3xl sm:text-4xl md:text-display-lg font-bold sm:max-w-sm">
							Our journey
						</h2>
						<p className="text-base sm:text-lg md:text-right text-muted-foreground/90 max-w-full md:max-w-[480px] font-medium">
							Building the future of financial infrastructure, one milestone at a time—from first line of
							code to billions in annual transaction volume.
						</p>
					</div>
				</motion.div>

				{/* Timeline */}
				<div className="max-w-5xl mx-auto relative">
					{/* Progress Line */}
					<div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden sm:block">
						<motion.div
							className="w-full bg-gradient-to-b from-primary-500 to-accent-500 origin-top"
							style={{ height: progressHeight }}/>
					</div>

					{/* Milestones */}
					<div className="space-y-12">
						{milestones.map((milestone, index) => {
							const isLeft = index % 2 === 0;
							const StatusIcon =
								milestone.status === "completed"
									? CheckCircle2
									: milestone.status === "current"
										? TrendingUp
										: Circle;

							return (
								<motion.div
									key={`${milestone.year}-${milestone.title}`}
									className={`relative flex items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} flex-col md:gap-12 gap-4`}
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, margin: "-50px" }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
								>
									{/* Status Indicator */}
									<div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10 hidden sm:flex">
										<div
											className={`w-16 h-16 rounded-full flex items-center justify-center ${
												milestone.status === "completed"
													? "bg-primary-500/20 border-2 border-primary-500"
													: milestone.status === "current"
														? "bg-accent-500/20 border-2 border-accent-500 animate-pulse"
														: "bg-muted border-2 border-border"
											}`}
										>
											<StatusIcon
												className={`h-7 w-7 ${
													milestone.status === "completed"
														? "text-primary-600"
														: milestone.status === "current"
															? "text-accent-600"
															: "text-muted-foreground"
												}`}/>
										</div>
									</div>

									{/* Content Card */}
									<div className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"} text-left`}>
										<Card
											variant={milestone.status === "current" ? "elevated" : "glass"}
											padding="lg"
											className="hover:shadow-depth-lg transition-all duration-300"
										>
											<div className="flex items-start justify-between gap-4 mb-3">
												<div className={isLeft ? "md:order-2" : ""}>
													<div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
														{milestone.quarter}
													</div>
													<div className="text-3xl font-bold text-primary-600">
														{milestone.year}
													</div>
												</div>
												{milestone.status === "current" && (
													<Badge variant="accent" className="animate-pulse">
														In Progress
													</Badge>
												)}
											</div>

											<h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
											<p className="text-sm text-muted-foreground leading-relaxed mb-4">
												{milestone.description}
											</p>

											{milestone.metrics && (
												<div className="flex flex-wrap gap-4 pt-4 border-t border-border">
													{milestone.metrics.map((metric) => (
														<div key={metric.label} className="flex-1 min-w-[100px]">
															<div className="text-2xl font-bold text-foreground">
																{metric.value}
															</div>
															<div className="text-xs text-muted-foreground uppercase tracking-wider">
																{metric.label}
															</div>
														</div>
													))}
												</div>
											)}
										</Card>
									</div>

									{/* Spacer for alignment */}
									<div className="flex-1 hidden md:block"/>
								</motion.div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}

