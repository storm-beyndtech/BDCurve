import { Landmark, Coins, ShieldCheck, Wallet } from "lucide-react";
import { MarketPanel, demoSeries } from "@/components/marketing/visuals";

/** Static (no network, no animation) hero-style panel for auth pages. Only rendered on lg+ screens. */
export function AuthSidePanel({ mode = "login" }: { mode?: "login" | "signup" }) {
	return mode === "login" ? (
		<MarketPanel
			eyebrow="Your portfolio"
			value="Stocks + Crypto"
			pill="One account"
			series={demoSeries(11, 30, 0.7)}
			listTitle="Pick up where you left off"
			rows={[
				{ label: "Traditional markets", sub: "US equities & ETFs", icon: Landmark },
				{ label: "Digital assets", sub: "BTC, ETH, SOL and more, 24/7", icon: Coins },
				{ label: "Unified balance", sub: "Settle everything in USDT", icon: Wallet },
			]}
			callout={{ title: "Secure sign-in", sub: "Encrypted sessions and verified accounts" }}
		/>
	) : (
		<MarketPanel
			eyebrow="Get started in minutes"
			value="3 simple steps"
			pill="Free"
			series={demoSeries(5, 30, 0.9)}
			listTitle="How it works"
			rows={[
				{ label: "1. Create your account", sub: "Email verification code", icon: ShieldCheck },
				{ label: "2. Fund with USDT, BTC or ETH", sub: "Deposit to your wallet address", icon: Wallet },
				{ label: "3. Trade both worlds", sub: "Stocks, ETFs and crypto", icon: Landmark },
			]}
			callout={{ title: "TradFi meets on-chain", sub: "One balance, one dashboard" }}
		/>
	);
}
