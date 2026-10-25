import { User } from "../models/User.js";
import { adminNotifyEmails, queueMail } from "./mailer.js";
import { appUrl, layout } from "./emailTemplates.js";

type Tx = { _id: unknown; userId: unknown; type: string; status: string; amount: number; symbol?: string | null; network?: string | null; address?: string | null; side?: string | null; quantity?: number | null; price?: number | null; description?: string | null };
export type TxEvent = "submitted" | "approved" | "rejected" | "executed" | "cancelled";

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const label = (t: string) => (t === "withdrawal" ? "Withdrawal" : t === "deposit" ? "Deposit" : t === "trade" ? "Trade" : "Transaction");

const NEXT: Record<string, Record<TxEvent, string>> = {
  deposit: {
    submitted: "We are confirming your transfer on the blockchain. Your balance is credited as soon as an admin approves it, usually within a few hours.",
    approved: "The funds are now in your balance and ready to trade.",
    rejected: "No funds were credited. If you believe this is a mistake, contact support with your transaction details.",
    executed: "", cancelled: "This deposit request was cancelled. No funds were credited.",
  },
  withdrawal: {
    submitted: "An admin will review your request, usually within 24 hours. Your balance is debited only when it is approved.",
    approved: "Your withdrawal was approved and is being sent to your wallet. Network confirmation can take a little while.",
    rejected: "Your balance was not debited. Check the reason below or contact support.",
    executed: "", cancelled: "This withdrawal request was cancelled.",
  },
  trade: {
    submitted: "Your limit order is open and will fill when the market reaches your price.",
    executed: "Your order was filled and your balances have been updated.",
    approved: "Your order was filled and your balances have been updated.",
    rejected: "Your order was not filled. No funds were moved.",
    cancelled: "Your order was cancelled. No funds were moved.",
  },
};

const titleFor = (tx: Tx, e: TxEvent) => {
  if (tx.type === "trade") return e === "submitted" ? "Limit order placed" : e === "rejected" ? "Order not filled" : e === "cancelled" ? "Order cancelled" : "Order filled";
  return `${label(tx.type)} ${e === "submitted" ? "received, pending review" : e}`;
};

function rowsFor(tx: Tx, e: TxEvent, reason?: string): [string, string][] {
  const rows: [string, string][] = [["Status", e === "submitted" ? "Pending" : e[0].toUpperCase() + e.slice(1)]];
  if (tx.type === "trade") {
    rows.push(["Order", `${String(tx.side || "").toUpperCase()} ${tx.quantity ?? ""} ${tx.symbol || ""}`.trim()]);
    if (tx.price) rows.push(["Price", money(tx.price)]);
  }
  rows.push(["Amount", money(tx.amount)]);
  if (tx.type !== "trade" && tx.symbol) rows.push(["Coin", tx.network ? `${tx.symbol} (${tx.network})` : tx.symbol]);
  if (tx.type === "withdrawal" && tx.address) rows.push(["To address", tx.address]);
  if (reason) rows.push(["Reason", reason]);
  rows.push(["Reference", String(tx._id)]);
  return rows;
}

/** Fire-and-forget: email the user (and admins on new deposit/withdrawal submissions). Never throws. */
export function notifyTransaction(tx: Tx, event: TxEvent, reason?: string) {
  void (async () => {
    try {
      const user = await User.findById(tx.userId).select("email name firstName").lean<{ email?: string; name?: { first?: string }; firstName?: string }>();
      const first = user?.firstName || user?.name?.first || "";
      const page = tx.type === "deposit" ? "/dashboard/deposit" : tx.type === "withdrawal" ? "/dashboard/withdrawal" : "/dashboard/transactions";
      if (user?.email) {
        queueMail(user.email, `${titleFor(tx, event)}: ${money(tx.amount)}`, layout({
          title: titleFor(tx, event),
          intro: `Hi${first ? ` ${first}` : ""}, ${NEXT[tx.type]?.[event] || "your transaction was updated."}`,
          rows: rowsFor(tx, event, reason),
          cta: { label: "View in your dashboard", url: appUrl(page) },
        }));
      }
      if (event === "submitted" && (tx.type === "deposit" || tx.type === "withdrawal")) {
        const admins = adminNotifyEmails();
        if (admins.length) {
          queueMail(admins, `[Action needed] New ${tx.type}: ${money(tx.amount)} from ${user?.email || "a user"}`, layout({
            title: `New ${tx.type} needs review`,
            intro: `${user?.email || "A user"} submitted a ${tx.type}. Review it in the admin panel.`,
            rows: rowsFor(tx, event),
            cta: { label: `Review ${tx.type}s`, url: appUrl(tx.type === "deposit" ? "/admin/deposits" : "/admin/withdrawals") },
          }));
        }
      }
    } catch (error) {
      console.error("[notify] transaction notification failed:", error instanceof Error ? error.message : error);
    }
  })();
}
