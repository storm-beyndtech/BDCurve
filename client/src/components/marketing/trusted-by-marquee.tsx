import React from "react";
import { LogoMarquee, ReviewMarquee, MarqueeReview } from "./visuals";

// ---------------- DATA ----------------
const trustedByLogos = [
	"TechCorp",
	"GlobalScale",
	"PayFlow",
	"FinanceHub",
	"CloudPay",
	"DataFlow",
	"Velocity",
	"Nexus",
	"Summit",
	"Frontier",
	"Quantum",
	"Zenith",
];

const customerReviews = [
	{
		author: "Alex Turner",
		role: "Active Trader",
		company: "Self-directed portfolio",
		content:
			"The fills are fast and the watchlist + mini charts feel live. I can jump from scan to order without losing context.",
		rating: 5,
	},
	{
		author: "Priya Nair",
		role: "Swing/Options",
		company: "Global markets",
		content: "Level 2 and depth data make it easy to react. Deposits/withdrawals clear faster than my old broker.",
		rating: 5,
	},
	{
		author: "Marcus Lee",
		role: "Crypto + Futures",
		company: "Multi-venue setup",
		content: "Order routing plus live websockets keep my futures and spot crypto in sync. Fallback pricing kept charts usable during outages.",
		rating: 5,
	},
	{
		author: "Isabella Rossi",
		role: "Long-term investor",
		company: "Wealth focus",
		content: "Research and chart consistency across desktop/mobile are solid. KYC and approvals were handled quickly by the admin team.",
		rating: 5,
	},
	{
		author: "Daniel Novak",
		role: "Day trader",
		company: "US/EU sessions",
		content: "Realtime quotes with compact buttons and floating sidebars made the workflow feel pro. Execution quality is on par with paid platforms.",
		rating: 5,
	},
	{
		author: "Elena Garcia",
		role: "Quant hobbyist",
		company: "API + charts",
		content: "Gradient charts, consistent logos, and the admin audit trail give me confidence. Historical fallbacks kept testing smooth.",
		rating: 5,
	},
];

// Duplicate to remove loop glitch
function duplicate<T>(arr: T[]): T[] {
	return [...arr, ...arr];
}

// ---------------- UI ----------------
function TextLogo({ name }: { name: string }) {
	return (
		<div className="px-6 py-3 text-xl font-bold tracking-tight text-gray-500/70 transition-all duration-300 hover:text-emerald-400 whitespace-nowrap">
			{name}
		</div>
	);
}

// ---------------- COMPONENT EXPORTS ----------------
export function TrustedByMarquee() {
	const logos = duplicate(trustedByLogos.map((name, i) => <TextLogo key={i} name={name} />));

	return <LogoMarquee logos={logos} duration={30} />;
}

export function TrustedByMarqueeCompact() {
	const logos = duplicate(trustedByLogos.slice(0, 6).map((name, i) => <TextLogo key={i} name={name} />));

	return <LogoMarquee logos={logos} duration={24} />;
}

export function CustomerReviewsMarquee() {
	const reviews = duplicate(customerReviews.map((review, i) => <MarqueeReview key={i} {...review} />));

	return (
		<ReviewMarquee
			reviews={reviews}
			title="What our traders say"
			description="Feedback from active investors across stocks and crypto"
			duration={40}
		/>
	);
}
