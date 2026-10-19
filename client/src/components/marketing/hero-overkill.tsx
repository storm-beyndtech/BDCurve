import { ArrowRight, Check, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLiveQuote } from "@/hooks/useLiveQuote";

const markets = [
	{ symbol: "BTC", name: "Bitcoin" },
	{ symbol: "ETH", name: "Ethereum" },
	{ symbol: "SOL", name: "Solana" },
];

const capabilities = [
	{ icon: Landmark, label: "Traditional markets" },
	{ icon: WalletCards, label: "On-chain assets" },
	{ icon: ShieldCheck, label: "One secure account" },
];

const formatPrice = (price?: number) => price == null
	? "—"
	: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: price < 10 ? 4 : 2 }).format(price);

function LiveMarketRow({ symbol, name }: { symbol: string; name: string }) {
	const { quote } = useLiveQuote(symbol, "crypto");
	const change = quote?.changePercent;
	return (
		<div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3.5">
			<div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/50 text-xs font-bold">{symbol.slice(0, 2)}</div>
			<div><p className="text-sm font-semibold">{symbol}</p><p className="text-xs text-muted-foreground">{name}</p></div>
			<div className="text-right">
				<p className="text-sm font-medium tabular-nums">{formatPrice(quote?.price)}</p>
				<p className={change == null ? "text-xs text-muted-foreground" : `text-xs font-medium ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
					{change == null ? "Waiting for quote" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
				</p>
			</div>
		</div>
	);
}

export function HeroOverkill() {
	const { quote: bitcoin, series, status } = useLiveQuote("BTC", "crypto");
	const recentSeries = series.slice(-12);
	const values = recentSeries.map((point) => point.value);
	const low = values.length ? Math.min(...values) : 0;
	const high = values.length ? Math.max(...values) : 0;
	const range = Math.max(high - low, high * 0.001, 1);
	const chartHeights = values.length >= 4
		? values.map((value) => 28 + ((value - low) / range) * 72)
		: [34, 42, 39, 48, 52, 50, 57, 61, 59, 66, 70, 74];

	return (
		<section className="border-b border-border bg-background">
			<div className="container-wide container-padding mx-auto grid min-h-[calc(100vh-4rem)] items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
				<div className="max-w-2xl">
					<div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground">
						<span className="h-2 w-2 rounded-full bg-primary-600" aria-hidden="true" />
						One account. Global opportunity.
					</div>
					<h1 className="max-w-[11ch] text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
						TradFi meets on-chain.
					</h1>
					<p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
						Access stocks and digital assets through one clear, professional platform built for how markets move now.
					</p>
					<div className="mt-9 flex flex-col gap-3 sm:flex-row">
						<Link to="/signup">
							<Button variant="primary" size="xl" className="w-full gap-2 sm:w-auto">
								Open an account <ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
						<Link to="/products">
							<Button variant="outline" size="xl" className="w-full sm:w-auto">Explore markets</Button>
						</Link>
					</div>
					<div className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
						{capabilities.map(({ icon: Icon, label }) => (
							<div key={label} className="flex items-center gap-2">
								<Icon className="h-4 w-4 text-primary-600" />
								<span>{label}</span>
							</div>
						))}
					</div>
				</div>

				<div className="relative mx-auto w-full max-w-xl">
					<div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/30">
						<div className="flex items-center justify-between border-b border-border px-6 py-5">
							<div>
								<p className="text-sm text-muted-foreground">Bitcoin / U.S. dollar</p>
								<p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{formatPrice(bitcoin?.price)}</p>
							</div>
							<div className="rounded-full bg-primary-500/10 px-3 py-1 text-sm font-semibold text-primary-600">
								{bitcoin ? `${bitcoin.changePercent >= 0 ? "+" : ""}${bitcoin.changePercent.toFixed(2)}%` : "Connecting"}
							</div>
						</div>
						<div className="px-6 py-6">
							<div className="mb-5 flex h-32 items-end gap-2 border-b border-border pb-1" aria-label="Portfolio performance illustration">
								{chartHeights.map((height, index) => (
									<div key={index} className={`flex-1 rounded-t-sm ${values.length >= 4 ? "bg-primary-600/80" : "bg-muted"}`} style={{ height: `${height}%` }} />
								))}
							</div>
							<div className="flex items-center justify-between pb-3">
								<p className="font-semibold">Markets</p>
								<p className="flex items-center gap-1 text-xs text-muted-foreground"><span className={`h-1.5 w-1.5 rounded-full ${status === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} /> {status === "connected" ? "Live" : "Connecting"}</p>
							</div>
							<div className="divide-y divide-border">
								{markets.map((market) => (
									<LiveMarketRow key={market.symbol} {...market} />
								))}
							</div>
						</div>
					</div>
					<div className="mx-auto -mt-5 flex w-[88%] items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 shadow-lg">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/10"><Check className="h-4 w-4 text-primary-600" /></div>
						<div><p className="text-sm font-semibold">Built for confident decisions</p><p className="text-xs text-muted-foreground">Live market data in one focused workspace</p></div>
					</div>
				</div>
			</div>
		</section>
	);
}
