import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api";
import { AssetLogo } from "@/components/common/asset-logo";

/**
 * Lightweight visual language borrowed from the landing hero card:
 * rounded panel, header value + pill, a sparkline, list rows and a floating "callout" chip.
 * Pure SVG + CSS (no recharts, no filters, no infinite animation) so it is safe on low-memory phones.
 */

export function Sparkline({ values, className, positive = true }: { values: number[]; className?: string; positive?: boolean }) {
	const path = useMemo(() => {
		const clean = values.filter((v) => Number.isFinite(v));
		if (clean.length < 2) return null;
		const min = Math.min(...clean);
		const max = Math.max(...clean);
		const range = max - min || 1;
		const pts = clean.map((v, i) => [(i / (clean.length - 1)) * 100, 36 - ((v - min) / range) * 32 - 2]);
		const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
		return { line, area: `${line} L100,40 L0,40 Z` };
	}, [values]);
	if (!path) return <div className={cn("h-full w-full rounded-md bg-muted/60", className)} />;
	const stroke = positive ? "hsl(var(--primary))" : "#ef4444";
	return (
		<svg viewBox="0 0 100 40" preserveAspectRatio="none" className={cn("h-full w-full", className)} aria-hidden="true">
			<path d={path.area} fill={stroke} opacity={0.08} />
			<path d={path.line} fill="none" stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
		</svg>
	);
}

export type PanelRow = { symbol?: string; type?: "crypto" | "stock"; label: string; sub?: string; value?: string; change?: number; icon?: ComponentType<{ className?: string }> };

export interface MarketPanelProps {
	eyebrow: string;
	value: string;
	pill?: string;
	pillTone?: "primary" | "positive" | "negative" | "muted";
	series?: number[];
	listTitle?: string;
	rows: PanelRow[];
	callout?: { title: string; sub: string };
	className?: string;
}

const pillTones = {
	primary: "bg-primary-500/10 text-primary-600",
	positive: "bg-emerald-500/10 text-emerald-600",
	negative: "bg-red-500/10 text-red-500",
	muted: "bg-muted text-muted-foreground",
};

export function MarketPanel({ eyebrow, value, pill, pillTone = "primary", series = [], listTitle, rows, callout, className }: MarketPanelProps) {
	return (
		<div className={cn("relative mx-auto w-full max-w-xl", className)}>
			<div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/30">
				<div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
					<div className="min-w-0">
						<p className="truncate text-sm text-muted-foreground">{eyebrow}</p>
						<p className="mt-1 truncate text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</p>
					</div>
					{pill && <div className={cn("shrink-0 rounded-full px-3 py-1 text-sm font-semibold", pillTones[pillTone])}>{pill}</div>}
				</div>
				<div className="px-5 py-5 sm:px-6">
					{series.length > 0 && (
						<div className="mb-4 h-24 border-b border-border pb-1">
							<Sparkline values={series} positive={pillTone !== "negative"} />
						</div>
					)}
					{listTitle && <p className="pb-2 font-semibold">{listTitle}</p>}
					<div className="divide-y divide-border">
						{rows.map((row) => {
							const Icon = row.icon;
							return (
								<div key={row.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
									{row.symbol ? (
										<AssetLogo symbol={row.symbol} name={row.label} type={row.type || "crypto"} size={32} />
									) : (
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10">
											{Icon ? <Icon className="h-4 w-4 text-primary-600" /> : <Check className="h-4 w-4 text-primary-600" />}
										</div>
									)}
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold">{row.label}</p>
										{row.sub && <p className="truncate text-xs text-muted-foreground">{row.sub}</p>}
									</div>
									<div className="text-right">
										{row.value && <p className="text-sm font-medium tabular-nums">{row.value}</p>}
										{row.change != null && (
											<p className={cn("text-xs font-medium", row.change >= 0 ? "text-emerald-600" : "text-red-500")}>
												{row.change >= 0 ? "+" : ""}
												{row.change.toFixed(2)}%
											</p>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
			{callout && (
				<div className="mx-auto -mt-5 flex w-[88%] items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 shadow-lg">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/10">
						<Check className="h-4 w-4 text-primary-600" />
					</div>
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold">{callout.title}</p>
						<p className="truncate text-xs text-muted-foreground">{callout.sub}</p>
					</div>
				</div>
			)}
		</div>
	);
}

const fmtUsd = (price?: number) =>
	price == null || !price
		? "—"
		: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: price < 1 ? 6 : price < 10 ? 4 : 2 }).format(price);

/** Deterministic decorative series (no network) for static panels. */
export const demoSeries = (seed = 1, points = 24, drift = 0.6) => {
	let v = 50;
	let s = seed;
	return Array.from({ length: points }, () => {
		s = (s * 9301 + 49297) % 233280;
		v += (s / 233280 - 0.5) * 6 + drift;
		return v;
	});
};

type CoinRow = { symbol: string; name: string; price: number; changePercent: number };

/** Live crypto panel (uses /api/coins once; no sockets). */
export function LiveCryptoPanel({ symbols = ["BTC", "ETH", "SOL"], eyebrow = "Digital assets", callout }: { symbols?: string[]; eyebrow?: string; callout?: MarketPanelProps["callout"] }) {
	const [coins, setCoins] = useState<Record<string, CoinRow>>({});
	useEffect(() => {
		apiGet<CoinRow[]>("/api/coins")
			.then((list) => setCoins(Object.fromEntries((list || []).map((c) => [c.symbol, c]))))
			.catch(() => undefined);
	}, []);
	const lead = coins[symbols[0]];
	return (
		<MarketPanel
			eyebrow={`${eyebrow} · ${symbols[0]}/USD`}
			value={fmtUsd(lead?.price)}
			pill={lead ? `${lead.changePercent >= 0 ? "+" : ""}${Number(lead.changePercent).toFixed(2)}%` : "Live"}
			pillTone={lead ? (lead.changePercent >= 0 ? "primary" : "negative") : "muted"}
			series={demoSeries(7, 28, lead && lead.changePercent < 0 ? -0.4 : 0.6)}
			listTitle="Markets"
			rows={symbols.slice(0, 4).map((symbol) => ({
				symbol,
				type: "crypto" as const,
				label: symbol,
				sub: coins[symbol]?.name || symbol,
				value: fmtUsd(coins[symbol]?.price),
				change: coins[symbol] ? Number(coins[symbol].changePercent) : undefined,
			}))}
			callout={callout}
		/>
	);
}

/** Static panel factory for ProductHeroOverkill's `customVisual` (expects a ComponentType). */
export const makePanel = (props: MarketPanelProps) => {
	const Panel = () => <MarketPanel {...props} />;
	return Panel;
};
