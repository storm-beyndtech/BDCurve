import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingBlurOrbs, HeroOrbit, HeroNetworkVisual } from "@/components/marketing/visuals";
import { ArrowRight, Globe, Shield, CheckCircle2, Sparkles } from "lucide-react";
import heroAsset from "@/assets/methods.svg";
const trustIndicators = [
	{
		icon: Shield,
		text: "FINRA & SIPC Protected",
	},
	{
		icon: Globe,
		text: "9,000+ Stocks",
	},
	{
		icon: CheckCircle2,
		text: "99.994% Uptime",
	},
];

export function HeroOverkill() {
	const { scrollY } = useScroll();
	const y = useTransform(scrollY, [0, 500], [0, 150]);
	const opacity = useTransform(scrollY, [0, 300], [1, 0]);

	return (
		<section className="relative min-h-[90vh] flex items-center py-20 lg:py-0">
			{/* Background Visual Layers */}
			<div className="absolute inset-0 -z-10">
				<MarketingBlurOrbs opacity={0.15}/>

				{/* Classic Orbital Rings */}
				<HeroOrbit size="lg" opacity={0.35}/>
			</div>

			{/* Content Container */}
			<motion.div className="w-full max-w-[1200px] mx-auto max-sm:px-6" style={{ opacity }}>
				<div className="flex items-center justify-between gap-8 lg:gap-12 min-h-[80vh]">
					{/* Left Column: Content */}
					<motion.div
						className="flex-1 space-y-10 z-10 max-w-[600px]"
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
					>
						{/* Announcement Badge */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Badge variant="glass" className="shadow-depth gap-2 px-4 py-1.5">
								<Sparkles className="h-3.5 w-3.5 text-primary-500"/>
								<span>Commission-free investing</span>
							</Badge>
						</motion.div>

						{/* Main Headline */}
						<motion.div
							className="space-y-6"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.3 }}
						>
							<h1 className="text-[2.2rem] md:text-[3.8rem]  font-bold font-mono leading-[1.3] sm:leading-[1.1] tracking-tight">
								Investing for those who{" "}
								<span className="text-primary-600">
									take it seriously
								</span>
							</h1>
						</motion.div>

						{/* Subheadline */}
						<motion.p
							className="text-lg text-muted-foreground max-w-lg leading-relaxed"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							Trade stocks, ETFs, options, and crypto with zero commissions. AI-powered insights, professional tools, and 24/7 support to help you invest smarter.
						</motion.p>

						{/* CTA Buttons */}
						<motion.div
							className="flex flex-col sm:flex-row gap-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.5 }}
						>
							<Link to="/signup">
								<Button
									variant="primary"
									size="xl"
									className="gap-2 group"
								>
									<span>Start investing now</span>
									<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1"/>
								</Button>
							</Link>

							<Link to="/products">
								<Button variant="glass" size="xl" className="gap-2 shadow-depth hover:shadow-depth-md">
									<span>View all products</span>
									<Sparkles className="h-4 w-4"/>
								</Button>
							</Link>
						</motion.div>

						{/* Trust Indicators */}
						<motion.div
							className="flex flex-wrap items-center gap-6 pt-4"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						>
							{trustIndicators.map((indicator, index) => (
								<motion.div
									key={indicator.text}
									className="flex items-center gap-2"
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
								>
									<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/10">
										<indicator.icon className="h-4 w-4 text-primary-600"/>
									</div>
									<span className="text-sm font-medium text-muted-foreground">{indicator.text}</span>
								</motion.div>
							))}
						</motion.div>
					</motion.div>

					{/* Right Column: 3D Floating Card Clusters */}
					<motion.div
						className="relative hidden lg:block flex-shrink-0 h-[700px] w-full lg:w-[450px] xl:w-[550px]"
						style={{ y }}
					>
						{/* Animated Network Visual Background */}
						<div className="absolute inset-0 scale-125 opacity-70">
							<HeroNetworkVisual/>
						</div>

						<div className="absolute inset-0 flex items-center justify-center">
							<img
								src={heroAsset}
								alt="heroAsset"
								width={400}
								height={700}
								className="w-full h-auto object-contain"
							/>
						</div>

						{/* Decorative Elements */}
						<motion.div
							className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-primary-500/8 blur-3xl"
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.3, 0.5, 0.3],
							}}
							transition={{
								duration: 8,
								repeat: Infinity,
								ease: "easeInOut",
							}}/>

						<motion.div
							className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent-500/6 blur-3xl"
							animate={{
								scale: [1, 1.3, 1],
								opacity: [0.2, 0.4, 0.2],
							}}
							transition={{
								duration: 10,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 2,
							}}/>

						{/* Floating Particles - Fixed positions to avoid hydration mismatch */}
						{[
							{ left: 25, top: 30 },
							{ left: 45, top: 65 },
							{ left: 70, top: 40 },
							{ left: 35, top: 75 },
							{ left: 60, top: 50 },
							{ left: 80, top: 25 },
						].map((pos, i) => (
							<motion.div
								key={i}
								className="absolute w-1 h-1 rounded-full bg-primary-500/30"
								style={{
									left: `${pos.left}%`,
									top: `${pos.top}%`,
								}}
								animate={{
									y: [0, -30, 0],
									opacity: [0, 1, 0],
								}}
								transition={{
									duration: 3 + i * 0.3,
									repeat: Infinity,
									delay: i * 0.5,
									ease: "easeInOut",
								}}/>
						))}
					</motion.div>
				</div>
			</motion.div>

			{/* Bottom Gradient Fade */}
			<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"/>
		</section>
	);
}

