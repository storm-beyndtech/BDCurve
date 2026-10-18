import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Zap,
	Shield,
	Code,
	BarChart3,
	Webhook,
	Clock,
	Lock,
	RefreshCw,
	Globe2,
	Database,
	Terminal,
	Blocks,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlatformCapabilitiesProps {
	className?: string;
}

const capabilities = [
	{
		category: "PERFORMANCE",
		icon: Zap,
		features: [
			{
				icon: Clock,
				title: "Real-time Processing",
				description: "Sub-second transaction processing and instant notifications",
			},
			{
				icon: RefreshCw,
				title: "99.99% Uptime",
				description: "Enterprise-grade reliability with automatic failover",
			},
		],
	},
	{
		category: "SECURITY",
		icon: Shield,
		features: [
			{
				icon: Lock,
				title: "End-to-End Encryption",
				description: "Bank-level security with AES-256 encryption at rest",
			},
			{
				icon: Database,
				title: "Compliance Built-in",
				description: "PCI DSS Level 1, SOC 2 Type II certified infrastructure",
			},
		],
	},
	{
		category: "DEVELOPER",
		icon: Code,
		features: [
			{
				icon: Terminal,
				title: "Modern REST APIs",
				description: "Comprehensive APIs with SDKs in 8+ languages",
			},
			{
				icon: Webhook,
				title: "Real-time Webhooks",
				description: "Instant event notifications for all transactions",
			},
		],
	},
	{
		category: "ANALYTICS",
		icon: BarChart3,
		features: [
			{
				icon: Globe2,
				title: "Global Insights",
				description: "Real-time dashboards with multi-currency analytics",
			},
			{
				icon: Blocks,
				title: "Custom Reporting",
				description: "Flexible reporting with data export in multiple formats",
			},
		],
	},
];

export function PlatformCapabilities({ className }: PlatformCapabilitiesProps) {
	return (
		<section className={cn("section-spacing-lg w-full relative overflow-hidden", className)}>
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-[0.02]">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
						backgroundSize: "48px 48px",
					}}/>
			</div>

			<div className="container-wide container-padding relative z-10">
				{/* Section Header */}
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.6 }}
				>
					<Badge variant="default" className="mb-4">
						PLATFORM
					</Badge>
				</motion.div>

				{/* Capabilities Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{capabilities.map((capability, categoryIndex) => (
						<motion.div
							key={capability.category}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
						>
							<Card variant="glass" hover="lift" className="h-full">
								<CardContent className="space-y-6">
									{capability.features.map((feature, featureIndex) => (
										<motion.div
											key={feature.title}
											className="flex gap-4 group"
											initial={{ opacity: 0, x: -20 }}
											whileInView={{ opacity: 1, x: 0 }}
											viewport={{ once: true }}
											transition={{
												duration: 0.4,
												delay: categoryIndex * 0.1 + featureIndex * 0.1,
											}}
										>
											<div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
												<feature.icon className="h-5 w-5 text-accent-600"/>
											</div>
											<div>
												<h3 className="text-base font-semibold mb-1 group-hover:text-primary-600 transition-colors">
													{feature.title}
												</h3>
												<p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
											</div>
										</motion.div>
									))}
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}


