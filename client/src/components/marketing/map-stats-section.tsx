import * as React from "react";
import { motion } from "framer-motion";
import { Globe, MapPin, Building, Users } from "lucide-react";
import { HeroOrbit } from "./visuals/hero-orbit";
import { cn } from "@/lib/utils";

export interface MapStatsSectionProps {
	className?: string;
}

export function MapStatsSection({ className }: MapStatsSectionProps) {
	return (
		<section className={cn("section-spacing-sm w-full relative overflow-hidden", className)}>
			{/* Background */}
			<div className="absolute inset-0 bg-ambient-marketing-section" />

			<div className="container-wide container-padding relative z-10">
				<div className="w-full">
					{/* Left: Map with Orbital Circle */}
					<motion.div
						className="relative h-[400px] lg:h-[500px]"
						initial={{ opacity: 0, scale: 0.95 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 0.8 }}
					>
						{/* Map SVG */}
						<motion.div
							className="absolute inset-0 flex items-center justify-center"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 1, delay: 0.2 }}
						>
							<div className="relative w-full">
								<img
									src="/map.png"
									width={1600}
									height={815}
									alt="Global coverage map"
									loading="lazy"
									decoding="async"
									className="w-full object-contain opacity-70 dark:opacity-60"
								/>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
