import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MarqueeContainerProps {
	/**
	 * Marquee rows
	 */
	children: React.ReactNode;
	/**
	 * Optional title above marquee
	 */
	title?: string;
	/**
	 * Optional description below title
	 */
	description?: string;
	/**
	 * Spacing between rows
	 * @default "md"
	 */
	rowSpacing?: "sm" | "md" | "lg";
	/**
	 * Optional className
	 */
	className?: string;
	/**
	 * Show title/description with animation
	 * @default true
	 */
	animated?: boolean;
}

const rowSpacingMap = {
	sm: "space-y-4",
	md: "space-y-6",
	lg: "space-y-8",
};

export function MarqueeContainer({
	children,
	title,
	description,
	rowSpacing = "md",
	className,
	animated = true,
}: MarqueeContainerProps) {
	return (
		<div className={cn("w-full overflow-hidden relative  mb-20", className)}>
			{/* Animated Motion Grid Background */}
			<div className="absolute inset-0 opacity-[0.03] pointer-events-none">
				<motion.div
					className="absolute inset-0"
					style={{
						backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
						backgroundSize: "48px 48px",
					}}
					animate={{
						backgroundPosition: ["0px 0px", "48px 48px"],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "linear",
					}}/>
			</div>

			{/* Header */}
			{(title || description) && (
				<div className="text-center mb-12  mt-20 px-4 relative z-10">
					{title && (
						<motion.h3
							initial={animated ? { opacity: 0, y: 20 } : {}}
							whileInView={animated ? { opacity: 1, y: 0 } : {}}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="text-2xl font-bold mb-2"
						>
							{title}
						</motion.h3>
					)}
					{description && (
						<motion.p
							initial={animated ? { opacity: 0, y: 20 } : {}}
							whileInView={animated ? { opacity: 1, y: 0 } : {}}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="text-muted-foreground"
						>
							{description}
						</motion.p>
					)}
				</div>
			)}

			{/* Marquee Rows */}
			<div className={cn(rowSpacingMap[rowSpacing], "relative z-10")}>{children}</div>
		</div>
	);
}

/**
 * Pre-configured logo marquee with mirrored rows
 */
export function LogoMarquee({
	logos,
	title,
	description,
	duration = 35,
}: {
	logos: React.ReactNode[];
	title?: string;
	description?: string;
	duration?: number;
}) {
	const midpoint = Math.ceil(logos.length / 2);
	const row1Logos = logos.slice(0, midpoint);
	const row2Logos = logos.slice(midpoint);

	return (
		<MarqueeContainer title={title} description={description} rowSpacing="md">
			{/* Row 1: Left to Right */}
			<div className="relative">
				<motion.div
					className="flex items-center"
					animate={{ x: [0, "-50%"] }}
					transition={{
						x: {
							repeat: Infinity,
							repeatType: "loop",
							duration: duration,
							ease: "linear",
						},
					}}
				>
					{[...row1Logos, ...row1Logos, ...row1Logos].map((logo, index) => (
						<div key={index}>{logo}</div>
					))}
				</motion.div>

				{/* Fade Overlays */}
				<div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"/>
				<div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"/>
			</div>

			{/* Row 2: Right to Left */}
			{row2Logos.length > 0 && (
				<div className="relative">
					<motion.div
						className="flex items-center"
						animate={{ x: ["-50%", 0] }}
						transition={{
							x: {
								repeat: Infinity,
								repeatType: "loop",
								duration: duration + 5,
								ease: "linear",
							},
						}}
					>
						{[...row2Logos, ...row2Logos, ...row2Logos].map((logo, index) => (
							<div key={index}>{logo}</div>
						))}
					</motion.div>

					{/* Fade Overlays */}
					<div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"/>
					<div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"/>
				</div>
			)}
		</MarqueeContainer>
	);
}

/**
 * Pre-configured review marquee with mirrored rows
 */
export function ReviewMarquee({
	reviews,
	title,
	description,
	duration = 40,
}: {
	reviews: React.ReactNode[];
	title?: string;
	description?: string;
	duration?: number;
}) {
	const midpoint = Math.ceil(reviews.length / 2);
	const row1Reviews = reviews.slice(0, midpoint);
	const row2Reviews = reviews.slice(midpoint);

	return (
		<MarqueeContainer title={title} description={description} rowSpacing="lg">
			{/* Row 1: Left to Right */}
			<div className="relative py-4">
				<motion.div
					className="flex items-center gap-4"
					animate={{ x: [0, "-50%"] }}
					transition={{
						x: {
							repeat: Infinity,
							repeatType: "loop",
							duration: duration,
							ease: "linear",
						},
					}}
				>
					{[...row1Reviews, ...row1Reviews, ...row1Reviews].map((review, index) => (
						<div key={index}>{review}</div>
					))}
				</motion.div>

				{/* Fade Overlays */}
				<div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"/>
				<div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"/>
			</div>

			{/* Row 2: Right to Left */}
			{row2Reviews.length > 0 && (
				<div className="relative py-4">
					<motion.div
						className="flex items-center gap-4"
						animate={{ x: ["-50%", 0] }}
						transition={{
							x: {
								repeat: Infinity,
								repeatType: "loop",
								duration: duration + 5,
								ease: "linear",
							},
						}}
					>
						{[...row2Reviews, ...row2Reviews, ...row2Reviews].map((review, index) => (
							<div key={index}>{review}</div>
						))}
					</motion.div>

					{/* Fade Overlays */}
					<div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"/>
					<div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"/>
				</div>
			)}
		</MarqueeContainer>
	);
}


