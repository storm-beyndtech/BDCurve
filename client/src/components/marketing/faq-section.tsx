import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQ {
	question: string;
	answer: string;
}

export interface FAQSectionProps {
	faqs: FAQ[];
	title?: string;
	description?: string;
	/**
	 * Show badge above title
	 */
	badge?: string;
	/**
	 * Number of columns
	 * @default 1
	 */
	columns?: 1 | 2;
}

export function FAQSection({
	faqs,
	title = "Frequently asked questions",
	description,
	badge = "FAQ",
	columns = 1,
}: FAQSectionProps) {
	const [openIndex, setOpenIndex] = React.useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<div className="space-y-8 py-10 container-wide container-padding">
			{/* Header */}
			<div className="w-full">
				{/* <Badge variant="accent" className="mb-4">
					{badge}
				</Badge> */}
				<h2 className="text-2xl sm:text-3xl md:text-display-sm font-mono font-bold mb-4">{title}</h2>
				{description && <p className="text-base sm:text-lg text-muted-foreground">{description}</p>}
			</div>

			{/* FAQ Items */}
			<div className={cn("w-full grid gap-3 sm:gap-4", columns === 2 ? "lg:grid-cols-2" : "")}>
				{faqs.map((faq, index) => (
					<Card key={index} variant="glass" padding="none" className="overflow-hidden">
						<button
							onClick={() => toggleFAQ(index)}
							className="w-full text-left p-4 sm:p-6 flex items-start justify-between gap-3 sm:gap-4 hover:bg-accent/5 transition-colors"
						>
							<span className="font-semibold text-sm sm:text-base pr-2 sm:pr-4">{faq.question}</span>
							<motion.div
								animate={{ rotate: openIndex === index ? 180 : 0 }}
								transition={{ duration: 0.2 }}
								className="flex-shrink-0"
							>
								<ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
							</motion.div>
						</button>

						<AnimatePresence initial={false}>
							{openIndex === index && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2, ease: "easeInOut" }}
								>
									<div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-muted-foreground">
										{faq.answer}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</Card>
				))}
			</div>
		</div>
	);
}
