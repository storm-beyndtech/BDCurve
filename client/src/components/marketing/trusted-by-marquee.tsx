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
			<p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Built with infrastructure partners across TradFi and DeFi</p>
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

type Trader = { _id?: string; name: string; username?: string; specialization?: string; winRate?: number; totalCopiers?: number; profitPercentage?: { monthly?: number; yearly?: number }; profileImage?: string; status?: string };

const fallbackTraders: Trader[] = [
	{ name: "Sarah Chen", specialization: "BTC & ETH swing", winRate: 78, totalCopiers: 1240, profitPercentage: { monthly: 6.4 } },
	{ name: "James Okafor", specialization: "US large caps", winRate: 71, totalCopiers: 860, profitPercentage: { monthly: 4.1 } },
	{ name: "Lena Müller", specialization: "DeFi blue chips", winRate: 74, totalCopiers: 990, profitPercentage: { monthly: 5.2 } },
	{ name: "Ravi Patel", specialization: "Tech momentum", winRate: 69, totalCopiers: 640, profitPercentage: { monthly: 3.8 } },
	{ name: "Ana Souza", specialization: "SOL ecosystem", winRate: 72, totalCopiers: 720, profitPercentage: { monthly: 5.9 } },
	{ name: "Tom Becker", specialization: "ETF rotation", winRate: 76, totalCopiers: 510, profitPercentage: { monthly: 2.9 } },
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
								<p className="truncate text-xs text-muted-foreground">{t.specialization || "Multi-asset"}</p>
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
