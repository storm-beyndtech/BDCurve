import { CheckCircle2, Clock, Loader2, XCircle, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Kind = "deposit" | "withdrawal" | "trade" | "profit" | string;
type Variant = "warning" | "success" | "destructive" | "outline";

export function txStatusInfo(type: Kind, status: string, audience: "user" | "admin" = "user"): { label: string; variant: Variant; next: string } {
	const s = String(status || "").toLowerCase();
	const admin = audience === "admin";
	if (s === "pending") {
		if (type === "deposit") return { label: "Pending review", variant: "warning", next: admin ? "Confirm the transfer on-chain, then approve to credit the user's balance." : "We're confirming your transfer. Your balance is credited once an admin approves it." };
		if (type === "withdrawal") return { label: "Pending review", variant: "warning", next: admin ? "Review and approve to debit the balance and send the funds, or reject with a reason." : "An admin will review it, usually within 24 hours. Your balance is debited only on approval." };
		if (type === "trade") return { label: "Open order", variant: "warning", next: "Fills when the market reaches your limit price." };
		return { label: "Pending", variant: "warning", next: "Awaiting processing." };
	}
	if (s === "processing") return { label: "Processing", variant: "outline", next: admin ? "Funds are being sent." : "Approved and being sent to your wallet." };
	if (["approved", "completed", "executed", "closed"].includes(s)) {
		if (type === "deposit") return { label: "Credited", variant: "success", next: admin ? "User balance credited." : "Funds are in your balance." };
		if (type === "withdrawal") return { label: "Approved", variant: "success", next: admin ? "Balance debited; funds released." : "Sent to your wallet. Network confirmation may take a little while." };
		if (type === "trade") return { label: "Filled", variant: "success", next: "Balances updated." };
		return { label: "Completed", variant: "success", next: "" };
	}
	if (s === "rejected" || s === "failed") return { label: "Rejected", variant: "destructive", next: type === "withdrawal" ? "Your balance was not debited." : type === "deposit" ? "No funds were credited. Contact support if this is unexpected." : "No funds were moved." };
	if (s === "cancelled") return { label: "Cancelled", variant: "outline", next: "No funds were moved." };
	return { label: s || "Unknown", variant: "outline", next: "" };
}

const ICON = { warning: Clock, success: CheckCircle2, destructive: XCircle, outline: Loader2 } as const;

export function TxStatusBadge({ type, status, audience = "user", className }: { type: Kind; status: string; audience?: "user" | "admin"; className?: string }) {
	const info = txStatusInfo(type, status, audience);
	const Icon = String(status).toLowerCase() === "cancelled" ? Ban : ICON[info.variant];
	return (
		<Badge variant={info.variant} className={cn("gap-1 whitespace-nowrap", className)} title={info.next}>
			<Icon aria-hidden className="h-3 w-3" />
			{info.label}
		</Badge>
	);
}

/** Badge plus a one-line "what happens next" explanation (and rejection reason, if any). */
export function TxStatus({ type, status, reason, audience = "user", className }: { type: Kind; status: string; reason?: string | null; audience?: "user" | "admin"; className?: string }) {
	const info = txStatusInfo(type, status, audience);
	const rejected = ["rejected", "failed"].includes(String(status).toLowerCase());
	return (
		<div className={cn("min-w-0 space-y-1", className)}>
			<TxStatusBadge type={type} status={status} audience={audience} />
			{info.next && <p className="break-words text-xs leading-4 text-muted-foreground">{info.next}</p>}
			{rejected && reason && <p className="break-words text-xs leading-4 text-red-600">Reason: {reason}</p>}
		</div>
	);
}
