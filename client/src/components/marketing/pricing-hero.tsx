import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroOrbit, MarketingBlurOrbs } from "@/components/marketing/visuals";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PricingHeroProps {
	className?: string;
}

const highlights = [
	"Commission-free stocks, ETFs, and options",
	"24/7 crypto trading with 40+ currencies",
	"Advanced encryption & multi-factor authentication",
	"No hidden fees, 24/7 customer support",
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.12,
			delayChildren: 0.2,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.7,
			ease: [0.4, 0.0, 0.2, 1],
		},
	},
};

/**
 * PricingHero - Hero section for the pricing page
 * Features competitive pricing messaging with motion visual on the right
 */
export function PricingHero({ className }: PricingHeroProps) {
	return (
		<section className={cn("relative min-h-[85vh] flex items-center py-20 lg:py-0", className)}>
			{/* Background Visual Layers */}
			<div className="absolute inset-0 -z-10">
				<MarketingBlurOrbs opacity={0.2}/>
			</div>

			{/* Content Container */}
			<div className="w-full max-w-[1200px] mx-auto px-6">
				<div className="flex items-center justify-between gap-8 lg:gap-16 min-h-[75vh]">
					{/* Left Column: Content */}
					<motion.div
						className="flex-1 space-y-8 z-10 max-w-[650px]"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{/* Badge */}
						<motion.div variants={itemVariants}>
							<Badge variant="glass" className="shadow-depth">
								Competitive Pricing
							</Badge>
						</motion.div>

						{/* Main Headline */}
						<motion.h1
							className="text-[2.5rem] md:text-[4rem] font-bold font-mono leading-[1.1] tracking-tight"
							variants={itemVariants}
						>
							Competitive{" "}
							<span className="text-primary-600">
								Pricing
							</span>{" "}
							for Your Business
						</motion.h1>

						{/* Description */}
						<motion.div className="space-y-4" variants={itemVariants}>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Commission-free trading platform built for investors of all levels. Get instant access to
								stocks, ETFs, options, crypto, and commodities with transparent pricing—zero commissions, no hidden fees.
							</p>

							<p className="text-lg text-muted-foreground leading-relaxed">
								Bank-grade security with advanced encryption, multi-factor authentication, and 24/7 support.
								Start trading with confidence on our professional-grade platform.
							</p>
						</motion.div>

						{/* Highlights */}
						<motion.div className="space-y-3" variants={itemVariants}>
							{highlights.map((highlight, index) => (
								<motion.div key={index} className="flex items-start gap-3" variants={itemVariants}>
									<div className="flex-shrink-0 mt-0.5">
										<div className="w-5 h-5 rounded-full bg-primary-500/10 flex items-center justify-center">
											<Check className="h-3 w-3 text-primary-600"/>
										</div>
									</div>
									<span className="text-base text-muted-foreground">{highlight}</span>
								</motion.div>
							))}
						</motion.div>

						{/* CTA Button */}
						<motion.div variants={itemVariants}>
							<Link to="/signup">
								<Button
									variant="primary"
									size="xl"
									className="gap-2 group"
								>
									<span>Get Started Free</span>
									<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1"/>
								</Button>
							</Link>
						</motion.div>
					</motion.div>

					{/* Right Column: Enhanced Motion Asset */}
					<motion.div
						className="relative hidden lg:block flex-shrink-0 h-[650px] w-full lg:w-[500px]"
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 1, ease: [0.4, 0.0, 0.2, 1], delay: 0.3 }}
					>
						{/* Pricing Illustration - Enhanced Orbital Pattern */}
						<div className="absolute inset-0 flex items-center justify-center">
							<HeroOrbit size="lg" opacity={0.9}/>
						</div>

						{/* Enhanced Decorative Glows */}
						<motion.div
							className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary-500/20 blur-3xl"
							animate={{
								scale: [1, 1.4, 1],
								opacity: [0.4, 0.7, 0.4],
								x: [0, 20, 0],
								y: [0, -20, 0],
							}}
							transition={{
								duration: 10,
								repeat: Infinity,
								ease: "easeInOut",
							}}/>

						<motion.div
							className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-accent-500/15 blur-3xl"
							animate={{
								scale: [1, 1.5, 1],
								opacity: [0.3, 0.6, 0.3],
								x: [0, -25, 0],
								y: [0, 25, 0],
							}}
							transition={{
								duration: 12,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 3,
							}}/>

						<motion.div
							className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-accent-500/12 blur-3xl"
							animate={{
								scale: [1, 1.3, 1],
								opacity: [0.2, 0.5, 0.2],
								rotate: [0, 180, 360],
							}}
							transition={{
								duration: 15,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 1.5,
							}}/>

						{/* Floating Price Cards with Enhanced Styling */}
						{[
							{ left: 15, top: 20, price: "$0", label: "Stocks & ETFs", delay: 0 },
							{ left: 65, top: 30, price: "$0.65", label: "Options", delay: 0.7, highlight: true },
							{ left: 35, top: 62, price: "0.5%", label: "Crypto Fee", delay: 1.4 },
						].map((tag, i) => (
							<motion.div
								key={i}
								className={cn(
									"absolute bg-glass-card border-glass shadow-depth-lg px-5 py-3 rounded-xl backdrop-blur-xl",
									tag.highlight && "border-primary-500/40"
								)}
								style={{
									left: `${tag.left}%`,
									top: `${tag.top}%`,
								}}
								animate={{
									y: [0, -20, 0],
									opacity: [0.8, 1, 0.8],
									scale: tag.highlight ? [1, 1.05, 1] : [1, 1.02, 1],
								}}
								transition={{
									duration: 5 + i * 0.8,
									repeat: Infinity,
									delay: tag.delay,
									ease: "easeInOut",
								}}
								whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
							>
								<div className="flex flex-col items-center gap-1">
									<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
										{tag.label}
									</span>
									<span className={cn(
										"text-lg font-bold",
										tag.highlight ? "text-primary-500" : "text-foreground"
									)}>
										{tag.price}
									</span>
								</div>
								{tag.highlight && (
									<div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary-500 animate-pulse"/>
								)}
							</motion.div>
						))}

						{/* Animated Connection Lines */}
						<svg className="absolute inset-0 w-full h-full pointer-events-none">
							<motion.path
								d="M 100 150 Q 250 200, 350 250"
								stroke="rgba(59, 130, 246, 0.2)"
								strokeWidth="2"
								fill="none"
								strokeDasharray="5,5"
								animate={{
									strokeDashoffset: [0, -10],
									opacity: [0.3, 0.6, 0.3],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "linear",
								}}/>
							<motion.path
								d="M 350 200 Q 200 300, 180 420"
								stroke="rgba(59, 130, 246, 0.15)"
								strokeWidth="2"
								fill="none"
								strokeDasharray="5,5"
								animate={{
									strokeDashoffset: [0, -10],
									opacity: [0.2, 0.5, 0.2],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: "linear",
									delay: 1,
								}}/>
						</svg>
					</motion.div>
				</div>
			</div>

			{/* Bottom Gradient Fade */}
			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"/>
		</section>
	);
}


