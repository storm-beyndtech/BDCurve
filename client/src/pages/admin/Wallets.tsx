import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { ChevronRight, Plus, Trash2, Wallet, X, Users, AlertTriangle } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DepositWallet {
	_id: string;
	symbol: string;
	network: string;
	address: string;
	label?: string;
	memo?: string;
	minDeposit: number;
	enabled: boolean;
	updatedAt?: string;
}

interface UserWalletRecord {
	_id: string;
	walletAddress: string;
	network?: string;
	connectionMethod?: string;
	connectedAt?: string;
	userId?: { email?: string; uid?: string } | null;
	suggested?: { symbol: string; network: string } | null;
	warning?: string | null;
}

type CoinOption = { symbol: string; name: string; network?: string };

const emptyForm = { symbol: "", network: "", address: "", label: "", memo: "", minDeposit: "10", enabled: true };
type FormState = typeof emptyForm;

const field =
	"w-full rounded-lg border border-border bg-background px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary";

const short = (a: string) => (a.length > 18 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a);

export default function AdminWalletsPage() {
	const [wallets, setWallets] = useState<DepositWallet[]>([]);
	const [coins, setCoins] = useState<CoinOption[]>([]);
	const [userWallets, setUserWallets] = useState<UserWalletRecord[]>([]);
	const [showUserWallets, setShowUserWallets] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editing, setEditing] = useState<DepositWallet | "new" | null>(null);
	const [prefill, setPrefill] = useState<Partial<FormState> | undefined>(undefined);
	const openNew = (initial?: Partial<FormState>) => {
		setPrefill(initial);
		setEditing("new");
	};

	const load = useCallback(async () => {
		setError("");
		try {
			const [w, c, u] = await Promise.all([
				apiGet<{ wallets: DepositWallet[] }>("/api/wallet/deposit"),
				apiGet<CoinOption[]>("/api/coins").catch(() => []),
				apiGet<{ wallets: UserWalletRecord[] }>("/api/wallet/all").catch(() => ({ wallets: [] })),
			]);
			setWallets(w.wallets || []);
			setCoins((Array.isArray(c) ? c : []).map((x) => ({ symbol: x.symbol, name: x.name, network: x.network })));
			setUserWallets(u.wallets || []);
			if (!(w.wallets || []).length && (u.wallets || []).length) setShowUserWallets(true);
		} catch (err: any) {
			setError(err?.message || "Failed to load wallets");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const enabledCount = useMemo(() => wallets.filter((w) => w.enabled).length, [wallets]);

	if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading wallets…</div>;

	return (
		<div className="mx-auto max-w-4xl space-y-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Deposit wallets</h1>
					<p className="text-sm text-muted-foreground">
						Addresses users send funds to. Each enabled wallet appears on the user Deposit page with its network, QR code and minimum.
					</p>
				</div>
				<button
					type="button"
					onClick={() => openNew()}
					className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
				>
					<Plus className="h-4 w-4" /> Add deposit wallet
				</button>
			</div>

			{wallets.length === 0 && (
				<div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
					<p className="font-semibold text-amber-700 dark:text-amber-400">No deposit wallets yet. Add one so users can deposit.</p>
					<p className="mt-1 text-muted-foreground">Until then the user Deposit page shows "Crypto deposits are not available yet".{userWallets.length ? " You have old wallet records below; use \"Convert to deposit wallet\" to reuse them." : ""}</p>
				</div>
			)}

			{error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}

			<p className="text-xs text-muted-foreground">
				{wallets.length} wallet{wallets.length === 1 ? "" : "s"} · {enabledCount} live on the Deposit page
			</p>

			{wallets.length === 0 ? (
				<div className="rounded-xl border border-dashed border-border p-6 text-center">
					<Wallet className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
					<p className="font-medium">No deposit wallets yet</p>
					<p className="mt-1 text-sm text-muted-foreground">Users currently see "Crypto deposits are not available yet". Add your first wallet to enable deposits.</p>
					<button type="button" onClick={() => openNew()} className="mt-4 min-h-[44px] rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
						Add deposit wallet
					</button>
				</div>
			) : (
				<ul className="space-y-2">
					{wallets.map((w) => (
						<li key={w._id}>
							<button
								type="button"
								onClick={() => setEditing(w)}
								className="flex w-full min-h-[64px] items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary"
							>
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{w.symbol.slice(0, 4)}</div>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-semibold">{w.symbol}</span>
										<span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{w.network}</span>
										<span className={cn("rounded-full px-2 py-0.5 text-xs", w.enabled ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground")}>
											{w.enabled ? "Live" : "Disabled"}
										</span>
									</div>
									<p className="truncate font-mono text-xs text-muted-foreground">{short(w.address)}</p>
									<p className="text-xs text-muted-foreground">
										{w.label ? `${w.label} · ` : ""}Min ${Number(w.minDeposit || 0).toLocaleString()}
									</p>
								</div>
								<ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
							</button>
						</li>
					))}
				</ul>
			)}

			{/* Legacy user-linked wallet records (not used for deposits) */}
			<div className="rounded-xl border border-border">
				<button
					type="button"
					onClick={() => setShowUserWallets((s) => !s)}
					className="flex min-h-[48px] w-full items-center justify-between gap-2 px-4 text-left text-sm font-medium"
				>
					<span className="flex items-center gap-2"><Users className="h-4 w-4" /> Old wallet records, not used for deposits ({userWallets.length})</span>
					<ChevronRight className={cn("h-4 w-4 transition-transform", showUserWallets && "rotate-90")} />
				</button>
				{showUserWallets && (
					<div className="space-y-2 border-t border-border p-3">
						<p className="text-xs text-muted-foreground">Records created with the previous "Add Wallet" form. They are NOT shown on the Deposit page. Convert one to make it a live deposit wallet.</p>
						{userWallets.length === 0 ? (
							<p className="text-sm text-muted-foreground">None.</p>
						) : (
							userWallets.map((u) => (
								<div key={u._id} className="rounded-lg border border-border p-3 text-sm">
									<p className="break-all font-mono text-xs">{u.walletAddress || "--"}</p>
									<p className="text-xs text-muted-foreground">
										{u.userId?.email || "Not linked to a user"} · {u.network || "network n/a"}
										{u.connectedAt ? ` · ${new Date(u.connectedAt).toLocaleDateString()}` : ""}
									</p>
									{u.warning && <p className="mt-1 flex items-start gap-1.5 text-xs text-amber-600"><AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="min-w-0 break-words">{u.warning}</span></p>}
									<button
										type="button"
										onClick={() => openNew({ symbol: u.suggested?.symbol || "", network: u.suggested?.network || u.network || "", address: u.walletAddress || "", label: "Converted from old record" })}
										className="mt-2 min-h-[44px] w-full rounded-lg border border-primary/40 px-3 text-sm font-medium text-primary hover:bg-primary/5 sm:w-auto"
									>
										Convert to deposit wallet
									</button>
								</div>
							))
						)}
					</div>
				)}
			</div>

			{editing && (
				<WalletSheet
					wallet={editing === "new" ? null : editing}
					initial={editing === "new" ? prefill : undefined}
					coins={coins}
					onClose={() => setEditing(null)}
					onSaved={async () => {
						setEditing(null);
						await load();
					}}
				/>
			)}
		</div>
	);
}

function WalletSheet({
	wallet,
	initial,
	coins,
	onClose,
	onSaved,
}: {
	wallet: DepositWallet | null;
	initial?: Partial<FormState>;
	coins: CoinOption[];
	onClose: () => void;
	onSaved: () => Promise<void>;
}) {
	const [form, setForm] = useState<FormState>(() =>
		wallet
			? { symbol: wallet.symbol, network: wallet.network, address: wallet.address, label: wallet.label || "", memo: wallet.memo || "", minDeposit: String(wallet.minDeposit ?? 0), enabled: wallet.enabled }
			: { ...emptyForm, ...(initial || {}) },
	);
	const [saving, setSaving] = useState(false);
	const [err, setErr] = useState("");

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [onClose]);

	const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		setErr("");
		if (!form.symbol) return setErr("Choose a coin");
		if (!form.network.trim()) return setErr("Network is required");
		if (!/^[A-Za-z0-9:_\-.]{10,200}$/.test(form.address.trim())) return setErr("Enter a valid address (no spaces)");
		setSaving(true);
		try {
			const body = { ...form, address: form.address.trim(), network: form.network.trim(), minDeposit: Number(form.minDeposit || 0) };
			if (wallet) await apiPut(`/api/wallet/deposit/${wallet._id}`, body);
			else await apiPost("/api/wallet/deposit", body);
			toast.success(wallet ? "Wallet updated" : "Deposit wallet added");
			await onSaved();
		} catch (error: any) {
			setErr(error?.message || "Save failed");
		} finally {
			setSaving(false);
		}
	};

	const remove = async () => {
		if (!wallet || !window.confirm(`Delete the ${wallet.symbol} (${wallet.network}) deposit wallet? Users will no longer see it.`)) return;
		setSaving(true);
		try {
			await apiDelete(`/api/wallet/deposit/${wallet._id}`);
			toast.success("Wallet deleted");
			await onSaved();
		} catch (error: any) {
			setErr(error?.message || "Delete failed");
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose} role="presentation">
			<div
				role="dialog"
				aria-modal="true"
				aria-label={wallet ? "Edit deposit wallet" : "Add deposit wallet"}
				onClick={(e) => e.stopPropagation()}
				className="flex h-[100dvh] w-full flex-col bg-background sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl sm:border sm:border-border"
			>
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<h2 className="text-lg font-semibold">{wallet ? `Edit ${wallet.symbol} wallet` : "Add deposit wallet"}</h2>
					<button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted">
						<X className="h-5 w-5" />
					</button>
				</div>
				<form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
					<div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
						<label className="block space-y-1">
							<span className="text-sm font-medium">Coin *</span>
							<select
								className={field}
								value={form.symbol}
								onChange={(e) => {
									const c = coins.find((x) => x.symbol === e.target.value);
									setForm((f) => ({ ...f, symbol: e.target.value, network: f.network || c?.network || "" }));
								}}
							>
								<option value="">Select a coin…</option>
								{coins.map((c) => (
									<option key={c.symbol} value={c.symbol}>
										{c.symbol} · {c.name}
									</option>
								))}
							</select>
						</label>
						<label className="block space-y-1">
							<span className="text-sm font-medium">Network *</span>
							<input className={field} value={form.network} onChange={(e) => set("network", e.target.value)} placeholder="e.g. TRC20, ERC20, Bitcoin" />
						</label>
						<label className="block space-y-1">
							<span className="text-sm font-medium">Deposit address *</span>
							<textarea
								className={cn(field, "min-h-[84px] font-mono")}
								value={form.address}
								onChange={(e) => set("address", e.target.value)}
								placeholder="Paste the receiving address"
								spellCheck={false}
								autoCapitalize="off"
								autoCorrect="off"
							/>
						</label>
						{form.address.trim().length >= 10 && (
							<div className="flex justify-center rounded-lg border border-border bg-white p-3">
								<QRCode value={form.address.trim()} size={120} />
							</div>
						)}
						<div className="grid gap-4 sm:grid-cols-2">
							<label className="block space-y-1">
								<span className="text-sm font-medium">Minimum deposit (USD)</span>
								<input className={field} type="number" inputMode="decimal" min="0" step="0.01" value={form.minDeposit} onChange={(e) => set("minDeposit", e.target.value)} />
							</label>
							<label className="block space-y-1">
								<span className="text-sm font-medium">Label (optional)</span>
								<input className={field} value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Treasury hot wallet" />
							</label>
						</div>
						<label className="block space-y-1">
							<span className="text-sm font-medium">Memo / tag (optional)</span>
							<input className={field} value={form.memo} onChange={(e) => set("memo", e.target.value)} placeholder="Only for networks that need one (XRP, XLM…)" />
						</label>
						<label className="flex min-h-[48px] items-center justify-between gap-3 rounded-lg border border-border px-3">
							<span className="text-sm font-medium">Show on Deposit page</span>
							<input type="checkbox" className="h-6 w-6 accent-[hsl(var(--primary))]" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} />
						</label>
						{err && <p className="text-sm text-red-600">{err}</p>}
					</div>
					<div className="flex flex-col-reverse gap-2 border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-between">
						{wallet ? (
							<button type="button" onClick={remove} disabled={saving} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-red-500/40 px-4 text-sm font-medium text-red-600 disabled:opacity-50">
								<Trash2 className="h-4 w-4" /> Delete
							</button>
						) : (
							<span />
						)}
						<button type="submit" disabled={saving} className="min-h-[44px] rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50">
							{saving ? "Saving…" : wallet ? "Save changes" : "Add wallet"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
