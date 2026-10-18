import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface WalletConnection {
	_id: string;
	walletAddress: string;
	connectionMethod: string;
	connectedAt: string;
	userId?: {
		_id: string;
		email: string;
		uid: string;
	};
}

export default function AdminWalletsPage() {
	const [wallets, setWallets] = useState<WalletConnection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

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

	if (loading) {
		return <div className="text-sm text-gray-500">Loading wallet records...</div>;
	}

	if (error) {
		return <div className="text-sm text-red-600">{error}</div>;
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Wallet Connections</h2>

			{wallets.length === 0 ? (
				<p className="text-sm text-gray-500">No wallet records found.</p>
			) : (
				<div className="overflow-x-auto rounded-md border">
					<table className="min-w-full text-left text-sm">
						<thead className="bg-gray-800">
							<tr>
								<th className="px-3 py-2">User Email</th>
								<th className="px-3 py-2">UID</th>
								<th className="px-3 py-2">Wallet Address</th>
								<th className="px-3 py-2">Method</th>
								<th className="px-3 py-2">Connected</th>
							</tr>
						</thead>
						<tbody>
							{wallets.map((wallet) => (
								<tr key={wallet._id} className="border-t border-gray-800 align-top">
									<td className="px-3 py-2">{wallet.userId?.email || "--"}</td>
									<td className="px-3 py-2">{wallet.userId?.uid || "--"}</td>
									<td className="px-3 py-2 font-mono text-xs">{wallet.walletAddress || "--"}</td>
									<td className="px-3 py-2">{wallet.connectionMethod}</td>
									<td className="px-3 py-2">{new Date(wallet.connectedAt).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
