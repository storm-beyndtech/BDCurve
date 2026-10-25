import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, ArrowUpDown, BadgeDollarSign, CandlestickChart, Search } from "lucide-react";
import { AssetLogo } from "@/components/common/asset-logo";
import { cn } from "@/lib/utils";
import { qty, usd, type Portfolio } from "@/lib/portfolio";
import { SwapSheet } from "./swap-sheet";

type SortKey = "value" | "change" | "name";

/** "Your assets": searchable, sortable holdings with quick Sell-to-USDT / Swap / Trade actions. */
export function HoldingsPanel({ portfolio, loading, onChanged, title = "Your assets", limit }: { portfolio: Portfolio | null; loading?: boolean; onChanged: () => void; title?: string; limit?: number }) {
	const navigate = useNavigate();
	const [q, setQ] = useState("");
	const [sort, setSort] = useState<SortKey>("value");
	const [hideDust, setHideDust] = useState(true);
	const [sheet, setSheet] = useState<{ mode: "swap" | "convert"; from?: string } | null>(null);

	const rows = useMemo(() => {
		const list = (portfolio?.holdings || []).filter((h) => (!hideDust || !h.dust || h.type === "cash") && (!q || `${h.symbol} ${h.name}`.toLowerCase().includes(q.toLowerCase())));
		list.sort((a, b) => (sort === "value" ? b.value - a.value : sort === "change" ? b.change24h - a.change24h : a.symbol.localeCompare(b.symbol)));
		return limit ? list.slice(0, limit) : list;
	}, [portfolio, q, sort, hideDust, limit]);

	const openTrade = (symbol: string, type: string) => navigate(type === "stock" ? `/dashboard/stocks/${symbol}` : `/dashboard/trade?symbol=${symbol}&type=crypto`);

	return (
		<section className="rounded-2xl border border-border bg-card" aria-label={title}>
			<div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
				<div>
					<h2 className="text-lg font-semibold">{title}</h2>
					<p className="text-xs text-muted-foreground">{portfolio ? `${portfolio.holdings.length} holding${portfolio.holdings.length === 1 ? "" : "s"} · ${usd(portfolio.totalValue)}` : loading ? "Loading…" : ""}</p>
				</div>
				<button type="button" onClick={() => setSheet({ mode: "swap" })} disabled={!portfolio?.holdings.some((h) => h.spot > 0)} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">
					<ArrowLeftRight className="h-4 w-4" /> Swap
				</button>
			</div>

			<div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:p-4">
				<label className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your assets" className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-base sm:text-sm" />
				</label>
				<div className="flex gap-2">
					<label className="relative flex-1 sm:flex-none">
						<ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-base sm:text-sm">
							<option value="value">Value</option>
							<option value="change">24h change</option>
							<option value="name">Name</option>
						</select>
					</label>
					<label className="flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-lg border border-border px-3 text-sm">
						<input type="checkbox" checked={hideDust} onChange={(e) => setHideDust(e.target.checked)} className="h-4 w-4" /> Hide &lt;$1
					</label>
				</div>
			</div>

			{loading && !portfolio ? (
				<div className="space-y-2 p-3 sm:p-4">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />)}</div>
			) : rows.length === 0 ? (
				<p className="p-6 text-center text-sm text-muted-foreground">{portfolio?.holdings.length ? "No assets match." : "You don't hold any assets yet. Deposit or trade to get started."}</p>
			) : (
				<ul className="divide-y divide-border">
					{rows.map((h) => (
						<li key={h.symbol} className="p-3 sm:p-4">
							<div className="flex items-center gap-3">
								<AssetLogo symbol={h.symbol} name={h.name} size={36} />
								<div className="min-w-0 flex-1">
									<div className="flex items-baseline justify-between gap-2">
										<p className="truncate font-semibold">{h.symbol}</p>
										<p className="shrink-0 font-semibold">{h.priced ? usd(h.value) : "--"}</p>
									</div>
									<div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
										<p className="truncate">{qty(h.quantity)} · {h.priced ? usd(h.price, h.price < 1 ? 6 : 2) : "price unavailable"}</p>
										<p className="shrink-0">
											{h.type !== "cash" && <span className={cn(h.change24h >= 0 ? "text-green-600" : "text-red-600")}>{h.change24h >= 0 ? "+" : ""}{h.change24h.toFixed(2)}%</span>}
											<span className="ml-2">{h.allocation.toFixed(1)}%</span>
										</p>
									</div>
									{h.pnl !== null && <p className={cn("text-xs", h.pnl >= 0 ? "text-green-600" : "text-red-600")}>P&amp;L {h.pnl >= 0 ? "+" : "-"}{usd(Math.abs(h.pnl))}{h.pnlPercent !== null ? ` (${h.pnlPercent.toFixed(1)}%)` : ""}</p>}
								</div>
							</div>
							{h.type !== "cash" && (
								<div className="mt-2 grid grid-cols-3 gap-2">
									<button type="button" disabled={!(h.spot > 0)} onClick={() => setSheet({ mode: "convert", from: h.symbol })} className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-50 sm:text-sm"><BadgeDollarSign className="h-4 w-4" /> Sell to USDT</button>
									<button type="button" disabled={!(h.spot > 0)} onClick={() => setSheet({ mode: "swap", from: h.symbol })} className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-50 sm:text-sm"><ArrowLeftRight className="h-4 w-4" /> Swap</button>
									<button type="button" onClick={() => openTrade(h.symbol, h.type)} className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted sm:text-sm"><CandlestickChart className="h-4 w-4" /> Trade</button>
								</div>
							)}
						</li>
					))}
				</ul>
			)}
			{limit && (portfolio?.holdings.length || 0) > limit && (
				<button type="button" onClick={() => navigate("/dashboard/assets")} className="min-h-[44px] w-full border-t border-border text-sm font-medium text-primary">View all assets</button>
			)}
			{portfolio?.unpricedSymbols.length ? <p className="px-4 pb-3 text-xs text-muted-foreground">No live price right now for {portfolio.unpricedSymbols.join(", ")}; excluded from the total.</p> : null}

			{sheet && portfolio && (
				<SwapSheet holdings={portfolio.holdings} initialFrom={sheet.from} mode={sheet.mode} onClose={() => setSheet(null)} onDone={onChanged} />
			)}
		</section>
	);
}
