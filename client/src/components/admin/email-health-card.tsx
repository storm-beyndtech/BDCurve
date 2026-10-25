import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { Card } from "@/components/ui/card";

type Status = { configured: boolean; provider: string; from: string; adminRecipients: number; lastFailure?: { subject?: string; error?: string; createdAt?: string } | null };

/** Shows whether email delivery is configured and lets the admin send a test email to themselves. */
export function EmailHealthCard() {
	const [status, setStatus] = useState<Status | null>(null);
	const [sending, setSending] = useState(false);

	const load = () => apiGet<Status>("/api/admin/email/status").then(setStatus).catch(() => setStatus(null));
	useEffect(() => {
		void load();
	}, []);

	const sendTest = async () => {
		setSending(true);
		try {
			const res = await apiPost<{ to: string; provider: string }>("/api/admin/email/test", {});
			toast.success(`Test email sent to ${res.to} via ${res.provider}`);
		} catch (error: any) {
			toast.error(error?.message || "Test email failed");
		} finally {
			setSending(false);
			void load();
		}
	};

	const ok = status?.configured;
	return (
		<Card variant="elevated" padding="md" className="space-y-3">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-start gap-2">
					{ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />}
					<div className="min-w-0">
						<p className="font-semibold">{status ? (ok ? `Email delivery: ${status.provider.toUpperCase()}` : "Email delivery is not configured") : "Checking email delivery..."}</p>
						<p className="break-words text-sm text-muted-foreground">
							{status ? (ok ? `From ${status.from}. Admin alert recipients: ${status.adminRecipients}.` : "Set RESEND_API_KEY (recommended) or SMTP_HOST/SMTP_USER/SMTP_PASSWORD on the server.") : ""}
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={sendTest}
					disabled={sending || !ok}
					className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
				>
					{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send test email to me
				</button>
			</div>
			{status?.lastFailure?.error && (
				<p className="flex items-start gap-1.5 break-words rounded-md border border-red-500/30 bg-red-500/5 p-2 text-xs text-red-600">
					<AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
					<span className="min-w-0">Last failure{status.lastFailure.createdAt ? ` (${new Date(status.lastFailure.createdAt).toLocaleString()})` : ""}: {status.lastFailure.error}</span>
				</p>
			)}
		</Card>
	);
}
