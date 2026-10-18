import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export interface ContentImageSectionProps {
	/**
	 * Section title
	 */
	title: string;
	/**
	 * Section description
	 */
	description: string;
	description2?: string;
	/**
	 * List of features or benefits
	 */
	features?: string[];
	/**
	 * Optional list items with icons
	 */
	listItems?: Array<{
		icon?: LucideIcon;
		title: string;
		description: string;
	}>;
	/**
	 * Image position
	 * @default "right"
	 */
	imagePosition?: "left" | "right";
	/**
	 * Image placeholder
	 * @default "800x600 placeholder"
	 */
	imagePlaceholder?: {
		width: number;
		height: number;
		alt: string;
		src: string;
	};
	/**
	 * Optional CTA button
	 */
	cta?: {
		label: string;
		href: string;
	};
	/**
	 * Section variant
	 * @default "default"
	 */
	variant?: "default" | "elevated" | "accent";
}

export function ContentImageSection({
	title,
	description,
	description2,
	features,
	listItems,
	imagePosition = "right",
	imagePlaceholder = { width: 800, height: 600, alt: "Feature illustration", src: "" },
	cta,
	variant = "default",
}: ContentImageSectionProps) {
	const isImageLeft = imagePosition === "left";

	const variantStyles = {
		default: "",
		elevated: "bg-muted/30",
		accent: "bg-accent/5",
	};

	return (
		<section className={cn("section-spacing-lg relative overflow-hidden w-full", variantStyles[variant])}>
			<div className="container-wide container-padding">
				<div
					className={cn(
						"grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center",
						isImageLeft && "lg:grid-flow-dense",
					)}
				>
					{/* Content Column */}
					<motion.div
						className={cn("space-y-6", isImageLeft && "lg:col-start-2")}
						initial={{ opacity: 0, x: isImageLeft ? 30 : -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						{/* Title */}
						<div className="space-y-6">
							<h2 className="text-balance max-w-[50ch] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
								{title}
							</h2>
							<p className="text-lg text-muted-foreground leading-relaxed dar">{description}</p>
							{description2 && (
								<p className="text-lg text-muted-foreground leading-relaxed dar">{description2}</p>
							)}
						</div>

						{/* Features List */}
						{features && features.length > 0 && (
							<ul className="space-y-3">
								{features.map((feature, index) => (
									<motion.li
										key={index}
										className="flex items-start gap-3"
										initial={{ opacity: 0, x: -10 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.4, delay: index * 0.1 }}
									>
										<div className="w-5 h-5 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
											<Check className="h-3.5 w-3.5 text-primary-600"/>
										</div>
										<span className="text-base text-foreground/90">{feature}</span>
									</motion.li>
								))}
							</ul>
						)}

						{/* List Items with Icons */}
						{listItems && listItems.length > 0 && (
							<div className="space-y-4">
								{listItems.map((item, index) => {
									const Icon = item.icon;
									return (
										<motion.div
											key={index}
											className="flex items-start gap-4"
											initial={{ opacity: 0, y: 10 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											transition={{ duration: 0.4, delay: index * 0.1 }}
										>
											{Icon && (
												<div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
													<Icon className="h-5 w-5 text-primary-600"/>
												</div>
											)}
											<div className="flex-1 space-y-1">
												<h3 className="text-base font-semibold">{item.title}</h3>
												<p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
											</div>
										</motion.div>
									);
								})}
							</div>
						)}

						{/* CTA Button */}
						{cta && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: 0.3 }}
							>
								<Button variant="primary" size="lg" className="gap-2">
									{cta.label}
								</Button>
							</motion.div>
						)}
					</motion.div>

					{/* Image Column */}
					<motion.div
						className={cn("relative", isImageLeft && "lg:col-start-1 lg:row-start-1")}
						initial={{ opacity: 0, x: isImageLeft ? -30 : 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						{/* Image Placeholder with rounded corners and shadow */}
						<img src={imagePlaceholder.src}
							alt={imagePlaceholder.alt}
							
							
							className="w-full"
						/>
					</motion.div>
				</div>
			</div>
		</section>
	);
}


