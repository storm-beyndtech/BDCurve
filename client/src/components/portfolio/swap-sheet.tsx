import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";
import { qty, usd, type Holding } from "@/lib/portfolio";

type Quote = { quoteId: string; from: string; to: string; fromQty: number; available: number; fromPrice: number; toPrice: number; rate: number; grossUsd: number; feeRate: number; fee: number; toQty: number; expiresAt: string; note: string };

const field = "w-full rounded-lg border border-border bg-background px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary";

/** Convert to USDT (mode="convert") or swap to any listed asset. Full-screen on mobile. */
export function SwapSheet({ holdings, initialFrom, mode = "swap", onClose, onDone }: { holdings: Holding[]; initialFrom?: string; mode?: "swap" | "convert"; onClose: () => void; onDone: () => void }) {
	const sources = useMemo(() => holdings.filter((h) => h.spot > 0), [holdings]);
	const [from, setFrom] = useState(initialFrom || sources.find((h) => h.type !== "cash")?.symbol || sources[0]?.symbol || "");
	const [to, setTo] = useState(mode === "convert" ? "USDT" : "");
	const [amount, setAmount] = useState("");
	const [percent, setPercent] = useState<number | null>(null);
	const [targets, setTargets] = useState<{ symbol: string; name: string }[]>([]);
	const [quote, setQuote] = useState<Quote | null>(null);
	const [loadingQuote, setLoadingQuote] = useState(false);
	const [executing, setExecuting] = useState(false);
	const [error, setError] = useState("");
	const [done, setDone] = useState<{ fromQty: number; toQty: number; from: string; to: string } | null>(null);
	const [now, setNow] = useState(Date.now());
	const reqId = useRef(0);

	const source = sources.find((h) => h.symbol === from);
	const available = source?.spot || 0;

	useEffect(() => {
		Promise.all([apiGet<any[]>("/api/coins").catch(() => []), apiGet<any[]>("/api/market/stocks").catch(() => [])]).then(([c, s]) => {
			const list = [{ symbol: "USDT", name: "Tether USD" }, ...(Array.isArray(c) ? c : []).filter((x) => x.symbol !== "USDT" && x.price > 0).map((x) => ({ symbol: x.symbol, name: x.name })), ...(Array.isArray(s) ? s : []).filter((x) => x.price > 0).map((x) => ({ symbol: x.symbol, name: x.name }))];
			setTargets(list);
		});
	}, []);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const t = window.setInterval(() => setNow(Date.now()), 1000);
		return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; window.clearInterval(t); };
	}, [onClose]);

	const requestQuote = useCallback(async () => {
		setError("");
		if (!from || !to || from === to) { setQuote(null); return; }
		const body = percent ? { from, to, percent } : { from, to, amount: Number(amount) };
		if (!percent && !(Number(amount) > 0)) { setQuote(null); return; }
		const id = ++reqId.current;
		setLoadingQuote(true);
		try {
			const q = await apiPost<Quote>("/api/portfolio/quote", body);
			if (id === reqId.current) setQuote(q);
		} catch (e: any) {
			if (id === reqId.current) { setQuote(null); setError(e?.message || "Could not get a quote"); }
		} finally {
			if (id === reqId.current) setLoadingQuote(false);
		}
	}, [from, to, amount, percent]);

	// Debounced auto-quote
	useEffect(() => {
		const t = window.setTimeout(() => void requestQuote(), 400);
		return () => window.clearTimeout(t);
	}, [requestQuote]);

	const secondsLeft = quote ? Math.max(0, Math.ceil((new Date(quote.expiresAt).getTime() - now) / 1000)) : 0;
	const expired = quote ? secondsLeft <= 0 : false;

	const confirm = async () => {
		if (!quote) return;
		setExecuting(true);
		setError("");
		try {
			const r = await apiPost<{ fromQty: number; toQty: number; from: string; to: string }>("/api/portfolio/swap", { quoteId: quote.quoteId });
			setDone(r);
			toast.success(`${mode === "convert" ? "Converted" : "Swapped"} ${qty(r.fromQty)} ${r.from} to ${qty(r.toQty)} ${r.to}`);
			onDone();
		} catch (e: any) {
			setError(e?.message || "Swap failed");
			void requestQuote();
		} finally {
			setExecuting(false);
		}
	};

	const pick = (p: number) => { setPercent(p); setAmount(String(Number(((available * p) / 100).toFixed(8)))); };

	return (
		<div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose} role="presentation">
			<div role="dialog" aria-modal="true" aria-label={mode === "convert" ? "Convert to USDT" : "Swap"} onClick={(e) => e.stopPropagation()} className="flex h-[100dvh] w-full flex-col bg-background sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl sm:border sm:border-border">
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<h2 className="text-lg font-semibold">{mode === "convert" ? "Convert to USDT" : "Swap"}</h2>
					<button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
				</div>

				{done ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
						<CheckCircle2 className="h-12 w-12 text-green-600" />
						<p className="text-lg font-semibold">Done</p>
						<p className="text-sm text-muted-foreground">{qty(done.fromQty)} {done.from} became {qty(done.toQty)} {done.to}. It now shows in your holdings and transaction history.</p>
						<button type="button" onClick={onClose} className="mt-2 min-h-[44px] w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground sm:w-auto">Close</button>
					</div>
				) : (
					<>
						<div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
							<label className="block space-y-1">
								<span className="text-sm font-medium">From</span>
								<select className={field} value={from} onChange={(e) => { setFrom(e.target.value); setAmount(""); setPercent(null); }}>
									{sources.map((h) => <option key={h.symbol} value={h.symbol}>{h.symbol} · {qty(h.spot)} available</option>)}
								</select>
							</label>
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm"><span className="font-medium">Amount</span><span className="text-muted-foreground">Available {qty(available)} {from}</span></div>
								<input className={field} type="number" inputMode="decimal" min="0" step="any" value={amount} onChange={(e) => { setAmount(e.target.value); setPercent(null); }} placeholder={`0.00 ${from}`} />
								<div className="grid grid-cols-4 gap-2">
									{[25, 50, 75, 100].map((p) => (
										<button key={p} type="button" onClick={() => pick(p)} className={cn("min-h-[40px] rounded-lg border text-sm", percent === p ? "border-primary bg-primary/10 text-primary" : "border-border")}>{p === 100 ? "Max" : `${p}%`}</button>
									))}
								</div>
							</div>
							<div className="flex justify-center"><ArrowDown className="h-5 w-5 text-muted-foreground" /></div>
							<label className="block space-y-1">
								<span className="text-sm font-medium">To</span>
								{mode === "convert" ? (
									<div className={cn(field, "bg-muted/40")}>USDT</div>
								) : (
									<select className={field} value={to} onChange={(e) => setTo(e.target.value)}>
										<option value="">Select an asset…</option>
										{targets.filter((t) => t.symbol !== from).map((t) => <option key={t.symbol} value={t.symbol}>{t.symbol} · {t.name}</option>)}
									</select>
								)}
							</label>

							<div className="rounded-xl border border-border p-3 text-sm">
								{loadingQuote ? (
									<p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Getting a live quote…</p>
								) : quote ? (
									<dl className="space-y-1.5">
										<div className="flex justify-between gap-2"><dt className="text-muted-foreground">You receive</dt><dd className="text-right font-semibold">{qty(quote.toQty)} {quote.to}</dd></div>
										<div className="flex justify-between gap-2"><dt className="text-muted-foreground">Rate</dt><dd className="text-right">1 {quote.from} = {qty(quote.rate)} {quote.to}</dd></div>
										<div className="flex justify-between gap-2"><dt className="text-muted-foreground">Value</dt><dd className="text-right">{usd(quote.grossUsd)}</dd></div>
										<div className="flex justify-between gap-2"><dt className="text-muted-foreground">Fee ({(quote.feeRate * 100).toFixed(1)}%)</dt><dd className="text-right">{usd(quote.fee, 4)}</dd></div>
										<div className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
											<span>{expired ? "Quote expired" : `Price held for ${secondsLeft}s`}</span>
											<button type="button" onClick={() => void requestQuote()} className="inline-flex min-h-[32px] items-center gap-1 text-primary"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
										</div>
										<p className="text-xs text-muted-foreground">Market prices move; if the quote expires, refresh to get the latest price. Minimum $100 unless you convert your full balance (Max).</p>
									</dl>
								) : (
									<p className="text-muted-foreground">Enter an amount{mode === "swap" ? " and choose an asset" : ""} to see a quote.</p>
								)}
							</div>
							{error && <p className="break-words text-sm text-red-600">{error}</p>}
						</div>
						<div className="border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
							<button type="button" disabled={!quote || expired || executing || loadingQuote} onClick={confirm} className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-medium text-primary-foreground disabled:opacity-50">
								{executing && <Loader2 className="h-4 w-4 animate-spin" />}
								{expired ? "Refresh quote to continue" : mode === "convert" ? "Convert now" : "Swap now"}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
