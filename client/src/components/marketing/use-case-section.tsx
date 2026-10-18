import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { UseCase } from "@/lib/products";

export interface UseCaseSectionProps {
	useCases: UseCase[];
	variant?: "default" | "glass" | "elevated";
}

export function UseCaseSection({ useCases, variant = "elevated" }: UseCaseSectionProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
			{useCases.map((useCase, index) => (
				<Card key={index} variant={variant} hover="lift" className="group relative overflow-hidden">
					{/* Fading Grid Overlay */}
					<div className="absolute inset-0 opacity-[0.03] pointer-events-none">
						<div
							className="absolute inset-0"
							style={{
								backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
								backgroundSize: "32px 32px",
								maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
								WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
							}}/>
					</div>

					<CardHeader className="space-y-4 relative z-10">
						<CardTitle className="text-xl group-hover:text-gray-500 transition-colors leading-tight mb-3">
							{useCase.title}
						</CardTitle>
					</CardHeader>

					<CardContent className="space-y-6 pt-0 relative z-10">
						<p className="text-sm text-muted-foreground leading-relaxed">{useCase.description}</p>

						{/* Benefits List */}
						<ul className="space-y-2.5">
							{useCase.benefits.map((benefit, i) => (
								<li key={i} className="flex items-start gap-2.5 text-xs">
									<CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0"/>
									<span className="text-muted-foreground leading-relaxed">{benefit}</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			))}
		</div>
	);
}


