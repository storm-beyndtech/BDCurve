import { useEffect, useState, type ReactNode } from "react";
import { Star, Users } from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Light CSS marquee: one row, content duplicated once, transform-only keyframes (GPU friendly),
 * no backdrop-filter, pauses on hover, and stops entirely under prefers-reduced-motion (globals.css).
 */
export function LightMarquee({ children, duration = 40, reverse = false, className }: { children: ReactNode; duration?: number; reverse?: boolean; className?: string }) {
	return (
		<div className={cn("group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", className)}>
			<div
				className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
				style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
			>
				<div className="flex shrink-0 gap-4 pr-4">{children}</div>
				<div className="flex shrink-0 gap-4 pr-4" aria-hidden="true">{children}</div>
			</div>
		</div>
	);
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
	return (
		<div className="container-wide container-padding mb-8 text-center">
			<h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
			{description && <p className="mt-2 text-muted-foreground">{description}</p>}
		</div>
	);
}

const partners = ["Binance", "Coinbase Prime", "Fireblocks", "Chainlink", "Circle", "Polygon", "Nasdaq Data", "Plaid", "Stripe", "Ledger", "Alpaca", "Cloudflare"];

export function TrustedByMarquee() {
	return (
		<section className="w-full border-y border-border py-8 sm:py-10">
			<LightMarquee duration={45}>
				{partners.map((name) => (
					<span key={name} className="whitespace-nowrap px-6 text-lg font-semibold tracking-tight text-muted-foreground/70">
						{name}
					</span>
				))}
			</LightMarquee>
		</section>
	);
}
export const TrustedByMarqueeCompact = TrustedByMarquee;

const reviews = [
	{ author: "Alex Turner", role: "Active trader", content: "I can jump from a stock chart to a crypto order without switching apps. Clean and fast." },
	{ author: "Priya Nair", role: "Swing trader", content: "Deposits cleared quickly and the dashboard keeps equities and digital assets in one view." },
	{ author: "Marcus Lee", role: "Crypto investor", content: "Live prices stay in sync and the charts finally look right on every timeframe." },
	{ author: "Isabella Rossi", role: "Long-term investor", content: "Verification was straightforward and support answered within the hour." },
	{ author: "Daniel Novak", role: "Day trader", content: "Simple order flow, clear minimums and no surprises on execution." },
	{ author: "Elena Garcia", role: "Portfolio builder", content: "Holding ETFs next to BTC and ETH in one balance is exactly what I wanted." },
];

export function CustomerReviewsMarquee() {
	return (
		<section className="w-full py-14 sm:py-20">
			<SectionTitle title="What our traders say" description="Feedback from investors across stocks and crypto" />
			<LightMarquee duration={60}>
				{reviews.map((r) => (
					<figure key={r.author} className="w-72 shrink-0 rounded-2xl border border-border bg-card p-5 sm:w-80">
						<div className="mb-3 flex gap-0.5" aria-label="5 out of 5 stars">
							{Array.from({ length: 5 }).map((_, i) => (
								<Star key={i} className="h-3.5 w-3.5 fill-primary-600 text-primary-600" />
							))}
						</div>
						<blockquote className="text-sm leading-relaxed text-foreground/90">“{r.content}”</blockquote>
						<figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-xs font-semibold text-primary-600">
								{r.author.split(" ").map((p) => p[0]).join("")}
							</div>
							<div>
								<p className="text-sm font-semibold">{r.author}</p>
								<p className="text-xs text-muted-foreground">{r.role}</p>
							</div>
						</figcaption>
					</figure>
				))}
			</LightMarquee>
		</section>
	);
}

type Trader = { _id?: string; name: string; username?: string; specialization?: string; winRate?: number; totalCopiers?: number; profitPercentage?: { monthly?: number; yearly?: number }; profileImage?: string; status?: string; specialties?: string[]; minimumCopyAmount?: number; riskLevel?: string };

const fallbackTraders: Trader[] = [
  { name: "Marcus Hale", specialization: "US large-cap equities", specialties: ["Equities", "Earnings"], winRate: 74, totalCopiers: 2310, profitPercentage: { monthly: 3.6, yearly: 41.8 }, minimumCopyAmount: 1000, riskLevel: "Low", profileImage: "https://ui-avatars.com/api/?name=Marcus%20Hale&background=1d4ed8&color=ffffff&size=256&bold=true" },
  { name: "Nadia Volkov", specialization: "Crypto swing", specialties: ["BTC & ETH", "Momentum"], winRate: 69, totalCopiers: 3120, profitPercentage: { monthly: 8.9, yearly: 112.4 }, minimumCopyAmount: 2500, riskLevel: "High", profileImage: "https://ui-avatars.com/api/?name=Nadia%20Volkov&background=7c3aed&color=ffffff&size=256&bold=true" },
  { name: "Lucas Brennan", specialization: "DeFi yield & on-chain", specialties: ["DeFi", "On-chain"], winRate: 77, totalCopiers: 1480, profitPercentage: { monthly: 5.2, yearly: 63.5 }, minimumCopyAmount: 1500, riskLevel: "Medium", profileImage: "https://ui-avatars.com/api/?name=Lucas%20Brennan&background=059669&color=ffffff&size=256&bold=true" },
  { name: "Elena Marquez", specialization: "ETFs & global macro", specialties: ["ETFs", "Macro"], winRate: 79, totalCopiers: 1950, profitPercentage: { monthly: 2.4, yearly: 28.9 }, minimumCopyAmount: 500, riskLevel: "Low", profileImage: "https://ui-avatars.com/api/?name=Elena%20Marquez&background=0f766e&color=ffffff&size=256&bold=true" },
  { name: "Daniel Weber", specialization: "FX & commodities", specialties: ["FX", "Gold & oil"], winRate: 66, totalCopiers: 1270, profitPercentage: { monthly: 4.7, yearly: 52.3 }, minimumCopyAmount: 750, riskLevel: "Medium", profileImage: "https://ui-avatars.com/api/?name=Daniel%20Weber&background=b45309&color=ffffff&size=256&bold=true" },
  { name: "Priya Raman", specialization: "AI & tech growth", specialties: ["AI", "Semis"], winRate: 71, totalCopiers: 2780, profitPercentage: { monthly: 7.1, yearly: 89.6 }, minimumCopyAmount: 2000, riskLevel: "High", profileImage: "https://ui-avatars.com/api/?name=Priya%20Raman&background=be185d&color=ffffff&size=256&bold=true" },
  { name: "Viktor Lindqvist", specialization: "Quant & arbitrage", specialties: ["Quant", "Multi-asset"], winRate: 82, totalCopiers: 3640, profitPercentage: { monthly: 6.3, yearly: 84.2 }, minimumCopyAmount: 5000, riskLevel: "Medium", profileImage: "https://ui-avatars.com/api/?name=Viktor%20Lindqvist&background=334155&color=ffffff&size=256&bold=true" },
];

export function CopyTradersMarquee() {
	const [traders, setTraders] = useState<Trader[]>(fallbackTraders);
	useEffect(() => {
		apiGet<Trader[]>("/api/trader")
			.then((list) => {
				const active = (list || []).filter((t) => t.status !== "inactive").slice(0, 12);
				if (active.length >= 3) setTraders(active);
			})
			.catch(() => undefined);
	}, []);
	return (
		<section className="w-full border-y border-border bg-muted/20 py-14 sm:py-20">
			<SectionTitle title="Copy top traders" description="Mirror experienced traders across equities and digital assets" />
			<LightMarquee duration={55} reverse>
				{traders.map((t) => (
					<div key={t._id || t.name} className="w-64 shrink-0 rounded-2xl border border-border bg-card p-4">
						<div className="flex items-center gap-3">
							{t.profileImage ? (
								<img src={t.profileImage} alt="" loading="lazy" className="h-10 w-10 rounded-full object-cover" />
							) : (
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-sm font-semibold text-primary-600">
									{t.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
								</div>
							)}
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold">{t.name}</p>
								<p className="truncate text-xs text-muted-foreground">{t.specialties?.length ? t.specialties.slice(0, 2).join(" · ") : t.specialization || "Multi-asset"}</p>
							</div>
						</div>
						<div className="mt-4 grid grid-cols-3 gap-2 text-center">
							<div>
								<p className="text-sm font-semibold text-emerald-600">+{Number(t.profitPercentage?.monthly || 0).toFixed(1)}%</p>
								<p className="text-[11px] text-muted-foreground">30d</p>
							</div>
							<div>
								<p className="text-sm font-semibold">{Number(t.winRate || 0).toFixed(0)}%</p>
								<p className="text-[11px] text-muted-foreground">Win rate</p>
							</div>
							<div>
								<p className="flex items-center justify-center gap-1 text-sm font-semibold">
									<Users className="h-3 w-3" />
									{Number(t.totalCopiers || 0).toLocaleString()}
								</p>
								<p className="text-[11px] text-muted-foreground">Copiers</p>
							</div>
						</div>
					</div>
				))}
			</LightMarquee>
		</section>
	);
}
