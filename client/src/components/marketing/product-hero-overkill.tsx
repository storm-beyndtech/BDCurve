import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingBlurOrbs, CompactOrbitalLines, HeroNetworkVisual } from "@/components/marketing/visuals";
import { LucideIcon } from "lucide-react";
export interface ProductHeroOverkillProps {
	/**
	 * Badge text (e.g., "CARD ISSUING")
	 */
	badge: string;
	/**
	 * Optional badge icon
	 */
	badgeIcon?: LucideIcon;
	/**
	 * Main headline (before highlight)
	 */
	headline: string;
	/**
	 * Highlighted part of headline (gradient text)
	 */
	headlineHighlight: string;
	/**
	 * Subheadline description
	 */
	subheadline: string;
	/**
	 * Primary CTA button
	 */
	primaryCTA: {
		label: string;
		href: string;
	};
	/**
	 * Optional secondary CTA button
	 */
	secondaryCTA?: {
		label: string;
		href: string;
	};
	/**
	 * Optional trust indicators below CTAs
	 */
	trustIndicators?: Array<{
		icon: LucideIcon;
		text: string;
	}>;
	/**
	 * Hero asset (imported SVG) - ignored if customVisual is provided
	 */
	heroAsset?: any;
	/**
	 * Optional className overrides for asset wrapper (e.g., dark-mode tweaks)
	 */
	heroAssetClassName?: string;
	/**
	 * Custom visual component (overrides heroAsset)
	 */
	customVisual?: React.ComponentType;
	/**
	 * Visual background type
	 * @default "network"
	 */
	visualBackground?: "network" | "orbital" | "minimal";
	/**
	 * Color theme for gradient accents
	 * @default "green"
	 */
	colorTheme?: "green" | "purple" | "blue";
}

export function ProductHeroOverkill({
	badge,
	badgeIcon: BadgeIcon,
	headline,
	headlineHighlight,
	subheadline,
	primaryCTA,
	secondaryCTA,
	trustIndicators,
	heroAsset,
	customVisual: CustomVisual,
	heroAssetClassName,
	visualBackground = "network",
	colorTheme = "blue",
}: ProductHeroOverkillProps) {
	const { scrollY } = useScroll();
	const y = useTransform(scrollY, [0, 500], [0, 150]);
	const opacity = useTransform(scrollY, [0, 300], [1, 0]);

	// Dynamic color classes based on theme
	const themeColors = {
		green: {
			gradient: "from-primary-400 to-primary-700",
			badgeIcon: "text-primary-500",
			badgeIconBg: "bg-primary-500/10",
			trustIconText: "text-primary-600",
			buttonGradient: "bg-gradient-to-r from-primary-500 to-primary-600",
			particleBg: "bg-primary-500/30",
		},
		blue: {
			gradient: "from-primary-400 to-primary-700",
			badgeIcon: "text-primary-500",
			badgeIconBg: "bg-primary-500/10",
			trustIconText: "text-primary-600",
			buttonGradient: "bg-gradient-to-r from-primary-500 to-primary-600",
			particleBg: "bg-primary-500/30",
		},
		purple: {
			gradient: "from-purple-400 to-purple-700",
			badgeIcon: "text-purple-500",
			badgeIconBg: "bg-purple-500/10",
			trustIconText: "text-purple-600",
			buttonGradient: "bg-gradient-to-r from-purple-500 to-purple-600",
			particleBg: "bg-purple-500/30",
		},
	};

	const colors = themeColors[colorTheme];

	return (
		<section className="relative min-h-[80vh] flex items-center py-16 lg:py-10 overflow-hidden">
			{/* Background Visual Layers */}
			<div className="absolute inset-0 -z-10">
				{/* Conditional Background Based on visualBackground Prop */}
				{visualBackground === "orbital" && (
					<div className="absolute inset-0 opacity-60">
						<CompactOrbitalLines parallax={true} parallaxIntensity={0.8}/>
					</div>
				)}
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
						{/* Badge */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Badge variant="glass" className="shadow-depth gap-2 px-4 py-1.5">
								{BadgeIcon && <BadgeIcon className={`h-3.5 w-3.5 ${colors.badgeIcon}`}/>}
								<span>{badge}</span>
							</Badge>
						</motion.div>

						{/* Main Headline */}
						<motion.div
							className="space-y-6"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.3 }}
						>
							<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.8rem] font-bold font-mono" style={{ lineHeight: "1.15" }}>
								{headline}{" "}
								<span className="text-primary-600">
									{headlineHighlight}
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
							{subheadline}
						</motion.p>

						{/* CTA Buttons */}
						<motion.div
							className="flex flex-col sm:flex-row gap-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.5 }}
						>
							<Button
								size="xl"
								className="gap-2 group bg-primary-600 hover:bg-primary-700 text-white transition-colors"
								asChild
							>
								<a href={primaryCTA.href}>
									<span>{primaryCTA.label}</span>
								</a>
							</Button>

							{secondaryCTA && (
								<Button variant="glass" size="xl" className="gap-2 shadow-depth hover:shadow-depth-md" asChild>
									<a href={secondaryCTA.href}>
										<span>{secondaryCTA.label}</span>
									</a>
								</Button>
							)}
						</motion.div>

						{/* Trust Indicators */}
						{trustIndicators && trustIndicators.length > 0 && (
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
										<div className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.badgeIconBg}`}>
											<indicator.icon className={`h-4 w-4 ${colors.trustIconText}`}/>
										</div>
										<span className="text-sm font-medium text-muted-foreground">{indicator.text}</span>
									</motion.div>
								))}
							</motion.div>
						)}
					</motion.div>

					{/* Right Column: Hero Asset */}
					<motion.div
						className="relative hidden lg:block flex-shrink-0 h-[640px] w-full lg:w-[440px] xl:w-[520px]"
						style={{ y }}
					>
						{/* Conditional Animated Background */}
						{visualBackground === "network" && (
							<div className="absolute inset-0 scale-110 opacity-45">
								<HeroNetworkVisual/>
							</div>
						)}

						{/* Hero Asset - Custom Visual or SVG Image */}
						{CustomVisual ? (
							<div className="absolute inset-0">
								<CustomVisual/>
							</div>
						) : heroAsset ? (
							<div className="absolute inset-0 flex items-center justify-center">
								<img
									src={heroAsset}
									alt="Product hero asset"
									width={400}
									height={700}
									className={`w-full h-auto object-contain ${heroAssetClassName || ""}`}
								/>
							</div>
						) : null}

						{/* Floating Particles */}
						{[...Array(6)].map((_, i) => {
							// Deterministic pseudo-random values to avoid hydration mismatch
							const leftOffset = 20 + ((i * 43) % 60);
							const topOffset = 20 + ((i * 29) % 60);
							const duration = 3 + ((i * 11) % 20) / 10;

							return (
								<motion.div
									key={i}
									className={`absolute w-1 h-1 rounded-full ${colors.particleBg}`}
									style={{
										left: `${leftOffset}%`,
										top: `${topOffset}%`,
									}}
									animate={{
										y: [0, -30, 0],
										opacity: [0, 1, 0],
									}}
									transition={{
										duration,
										repeat: Infinity,
										delay: i * 0.5,
										ease: "easeInOut",
									}}/>
							);
						})}
					</motion.div>
				</div>
			</motion.div>

			{/* Bottom Gradient Fade */}
			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"/>
		</section>
	);
}


