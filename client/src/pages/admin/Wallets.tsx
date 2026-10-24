import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";

interface WalletConnection {
	_id: string;
	walletAddress: string;
	connectionMethod: string;
	connectedAt: string;
	network?: string;
	status?: string;
	userId?: {
		_id: string;
		email: string;
		uid: string;
	};
}

const emptyForm = { address: "", network: "", provider: "manual", status: "connected", userEmail: "" };
const inputClass =
	"w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export default function AdminWalletsPage() {
	const [wallets, setWallets] = useState<WalletConnection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState(emptyForm);
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState("");

	const fetchWallets = async () => {
		try {
			const response = await apiGet<{ wallets: WalletConnection[] }>("/api/wallet/all");
			setWallets(response.wallets || []);
		} catch (err: any) {
			setError(err.message || "Failed to fetch wallet connections");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchWallets();
	}, []);

	const handleCreate = async (e: FormEvent) => {
		e.preventDefault();
		setFormError("");
		if (!form.address.trim()) {
			setFormError("Wallet address is required");
			return;
		}
		setSaving(true);
		try {
			const res = await apiPost<{ wallet: WalletConnection }>("/api/wallet", form);
			setWallets((prev) => [res.wallet, ...prev]);
			setForm(emptyForm);
			setShowForm(false);
		} catch (err: any) {
			setFormError(err.message || "Failed to create wallet");
		} finally {
			setSaving(false);
		}
	};

	const update = (key: keyof typeof emptyForm) => (e: { target: { value: string } }) =>
		setForm((f) => ({ ...f, [key]: e.target.value }));

	if (loading) {
		return <div className="text-sm text-gray-500">Loading wallet records...</div>;
	}

	if (error) {
		return <div className="text-sm text-red-600">{error}</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-2xl font-semibold">Wallet Connections</h2>
					<p className="text-sm text-muted-foreground">
						User wallet records. Deposit addresses shown to users are set per coin and network in{" "}
						<Link to="/admin/settings" className="font-medium text-primary underline-offset-2 hover:underline">Settings › Coins</Link>.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowForm((s) => !s)}
					className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
				>
					{showForm ? "Cancel" : "Add Wallet"}
				</button>
			</div>

			{showForm && (
				<form onSubmit={handleCreate} className="grid gap-3 rounded-md border border-gray-800 p-4 sm:grid-cols-2">
					<label className="space-y-1 sm:col-span-2">
						<span className="text-xs text-gray-400">Wallet address *</span>
						<input className={`${inputClass} font-mono`} value={form.address} onChange={update("address")} placeholder="0x..." required />
					</label>
					<label className="space-y-1">
						<span className="text-xs text-gray-400">Network</span>
						<input className={inputClass} value={form.network} onChange={update("network")} placeholder="e.g. ERC20, TRC20, BTC" />
					</label>
					<label className="space-y-1">
						<span className="text-xs text-gray-400">Assign to user (email, optional)</span>
						<input className={inputClass} type="email" value={form.userEmail} onChange={update("userEmail")} placeholder="user@example.com" />
					</label>
					<label className="space-y-1">
						<span className="text-xs text-gray-400">Method / provider</span>
						<input className={inputClass} value={form.provider} onChange={update("provider")} />
					</label>
					<label className="space-y-1">
						<span className="text-xs text-gray-400">Status</span>
						<select className={`${inputClass} bg-background`} value={form.status} onChange={update("status")}>
							<option value="connected">connected</option>
							<option value="active">active</option>
							<option value="disconnected">disconnected</option>
						</select>
					</label>
					{formError && <p className="text-sm text-red-500 sm:col-span-2">{formError}</p>}
					<div className="sm:col-span-2">
						<button
							type="submit"
							disabled={saving}
							className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 sm:w-auto"
						>
							{saving ? "Saving..." : "Create Wallet"}
						</button>
					</div>
				</form>
			)}

			{wallets.length === 0 ? (
				<p className="text-sm text-gray-500">No wallet records found.</p>
			) : (
				<>
					{/* Mobile cards */}
					<div className="space-y-3 md:hidden">
						{wallets.map((wallet) => (
							<div key={wallet._id} className="space-y-1 rounded-md border border-gray-800 p-3 text-sm">
								<p className="break-all font-mono text-xs">{wallet.walletAddress || "--"}</p>
								<p className="text-gray-400">{wallet.userId?.email || "Unassigned"}</p>
								<div className="flex flex-wrap gap-x-3 text-xs text-gray-500">
									<span>{wallet.network || "--"}</span>
									<span>{wallet.connectionMethod}</span>
									<span>{wallet.connectedAt ? new Date(wallet.connectedAt).toLocaleString() : "--"}</span>
								</div>
							</div>
						))}
					</div>
					{/* Desktop table */}
					<div className="hidden overflow-x-auto rounded-md border md:block">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-gray-800">
								<tr>
									<th className="px-3 py-2">User Email</th>
									<th className="px-3 py-2">UID</th>
									<th className="px-3 py-2">Wallet Address</th>
									<th className="px-3 py-2">Network</th>
									<th className="px-3 py-2">Method</th>
									<th className="px-3 py-2">Connected</th>
								</tr>
							</thead>
							<tbody>
								{wallets.map((wallet) => (
									<tr key={wallet._id} className="border-t border-gray-800 align-top">
										<td className="px-3 py-2">{wallet.userId?.email || "--"}</td>
										<td className="px-3 py-2">{wallet.userId?.uid || "--"}</td>
										<td className="break-all px-3 py-2 font-mono text-xs">{wallet.walletAddress || "--"}</td>
										<td className="px-3 py-2">{wallet.network || "--"}</td>
										<td className="px-3 py-2">{wallet.connectionMethod}</td>
										<td className="px-3 py-2">{wallet.connectedAt ? new Date(wallet.connectedAt).toLocaleString() : "--"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
}
