import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { AuditLog, EmailLog, Wallet } from "../models/Operations.js";
import { DepositWallet } from "../models/DepositWallet.js";
import { inferLegacyWallet, isKnownCoin, migrateLegacyCoinAddresses, parseDepositWallet } from "../services/depositWallets.js";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { adminNotifyEmails, mailConfigured, mailProvider, sendMail } from "../services/mailer.js";
import { layout, SUPPORT_PHONE } from "../services/emailTemplates.js";
import { env } from "../config/env.js";
import { getMinTradeAmount, setMinTradeAmount } from "../services/settings.js";

export const walletRouter = Router();
export const adminRouter = Router();
export const contactRouter = Router();
export const withdrawalsRouter = Router();

walletRouter.use(authenticate);
const serializeWallet = (w: any) => {
  const o = typeof w.toObject === "function" ? w.toObject() : w;
  const inferred = inferLegacyWallet(o);
  return { ...o, walletAddress: o.address, connectionMethod: o.provider || "manual", connectedAt: o.createdAt, suggested: inferred.ok ? { symbol: inferred.symbol, network: inferred.network } : null, warning: inferred.ok ? null : inferred.reason };
};
/* ---- Platform deposit wallets (admin CRUD). These feed /api/coins and the user Deposit page. ---- */
walletRouter.get("/deposit", requireAdmin, async (_req, res) => {
  await migrateLegacyCoinAddresses();
  res.json({ wallets: await DepositWallet.find().sort({ symbol: 1, network: 1 }).lean() });
});
walletRouter.post("/deposit", requireAdmin, async (req, res) => {
  const parsed = parseDepositWallet(req.body || {});
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  const v = parsed.value as Record<string, any>;
  if (!(await isKnownCoin(v.symbol))) return res.status(400).json({ message: `${v.symbol} is not a listed coin. Add it in Settings first.` });
  if (await DepositWallet.exists({ symbol: v.symbol, network: v.network })) return res.status(409).json({ message: `A ${v.symbol} wallet on ${v.network} already exists. Edit it instead.` });
  const wallet = await DepositWallet.create(v);
  await AuditLog.create({ actorId: req.user!._id, action: "depositWallet.create", targetType: "DepositWallet", targetId: String(wallet._id), metadata: { symbol: v.symbol, network: v.network } });
  res.status(201).json({ wallet });
});
walletRouter.put("/deposit/:id", requireAdmin, async (req, res) => {
  const parsed = parseDepositWallet(req.body || {}, true);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  const v = parsed.value as Record<string, any>;
  const existing = await DepositWallet.findById(req.params.id).catch(() => null);
  if (!existing) return res.status(404).json({ message: "Wallet not found" });
  const symbol = v.symbol ?? existing.symbol;
  const network = v.network ?? existing.network;
  if (v.symbol && !(await isKnownCoin(symbol))) return res.status(400).json({ message: `${symbol} is not a listed coin` });
  if (await DepositWallet.exists({ symbol, network, _id: { $ne: existing._id } })) return res.status(409).json({ message: `A ${symbol} wallet on ${network} already exists` });
  existing.set(v);
  await existing.save();
  await AuditLog.create({ actorId: req.user!._id, action: "depositWallet.update", targetType: "DepositWallet", targetId: String(existing._id), metadata: { symbol, network, fields: Object.keys(v) } });
  res.json({ wallet: existing });
});
walletRouter.delete("/deposit/:id", requireAdmin, async (req, res) => {
  const wallet = await DepositWallet.findByIdAndDelete(req.params.id).catch(() => null);
  if (!wallet) return res.status(404).json({ message: "Wallet not found" });
  await AuditLog.create({ actorId: req.user!._id, action: "depositWallet.delete", targetType: "DepositWallet", targetId: String(wallet._id), metadata: { symbol: wallet.symbol, network: wallet.network } });
  res.json({ message: "Wallet deleted" });
});

/* ---- Legacy user-linked wallet records ---- */
walletRouter.get("/all", requireAdmin, async (_req, res) => {
  const wallets = await Wallet.find().populate("userId", "email name uid").sort({ createdAt: -1 });
  res.json({ wallets: wallets.map(serializeWallet) });
});
walletRouter.post("/", requireAdmin, async (req, res) => {
  const address = String(req.body.address || "").trim();
  const provider = String(req.body.provider || "manual").trim();
  const network = String(req.body.network || "").trim();
  const status = String(req.body.status || "connected").trim();
  const userEmail = String(req.body.userEmail || "").trim().toLowerCase();
  if (!address) return res.status(400).json({ message: "Wallet address is required" });
  let userId: unknown = undefined;
  if (userEmail) {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "No user found with that email" });
    userId = user._id;
  }
  const wallet = await Wallet.create({ address, provider, network, status, userId });
  await AuditLog.create({ actorId: req.user!._id, action: "wallet.create", targetType: "Wallet", targetId: String(wallet._id), metadata: { address, network, userEmail } });
  await wallet.populate("userId", "email name uid");
  res.status(201).json({ message: "Wallet created", wallet: serializeWallet(wallet) });
});

adminRouter.use(authenticate, requireAdmin);
adminRouter.get("/audit-logs", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const query = req.query.action ? { action: String(req.query.action) } : {};
  const [logs, total] = await Promise.all([AuditLog.find(query).populate("actorId", "email name").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), AuditLog.countDocuments(query)]);
  res.json({ logs, page, total, totalPages: Math.ceil(total / limit) });
});
adminRouter.get("/audit-stats", async (_req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [total, todayCount, thisWeek, uniqueActors] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ createdAt: { $gte: today } }),
    AuditLog.countDocuments({ createdAt: { $gte: week } }),
    AuditLog.distinct("actorId"),
  ]);
  res.json({ total, today: todayCount, thisWeek, uniqueAdmins: uniqueActors.filter(Boolean).length });
});
adminRouter.get("/settings", async (_req, res) => res.json({ minTradeAmount: await getMinTradeAmount() }));
adminRouter.put("/settings", async (req, res) => {
  const minTradeAmount = Number(req.body.minTradeAmount);
  if (!Number.isFinite(minTradeAmount) || minTradeAmount < 0 || minTradeAmount > 1_000_000) {
    return res.status(400).json({ message: "minTradeAmount must be a number between 0 and 1,000,000" });
  }
  await setMinTradeAmount(minTradeAmount);
  await AuditLog.create({ actorId: req.user!._id, action: "settings.update", targetType: "Setting", targetId: "minTradeAmount", metadata: { minTradeAmount } });
  res.json({ minTradeAmount });
});
adminRouter.get("/email/status", async (_req, res) => {
  const lastFailure = await EmailLog.findOne({ status: "failed" }).sort({ createdAt: -1 }).select("subject error createdAt").lean();
  res.json({ configured: mailConfigured, provider: mailProvider, from: env.MAIL_FROM || env.SMTP_FROM, adminRecipients: adminNotifyEmails().length, lastFailure });
});
/** Sends a test email ONLY to the requesting admin (or configured admin notify addresses). */
adminRouter.post("/email/test", async (req, res) => {
  const to = req.user?.email || adminNotifyEmails()[0];
  if (!to) return res.status(400).json({ message: "No admin email to send to" });
  try {
    const result = await sendMail(to, "Bounding Curve test email", layout({ title: "Email is working", intro: `This test was sent from the admin panel via ${mailProvider}. Transaction emails will be delivered the same way.`, footnote: `Support line shown to users: ${SUPPORT_PHONE}` }));
    res.json({ ok: true, provider: mailProvider, to, messageId: result.messageId });
  } catch (error) {
    res.status(502).json({ ok: false, provider: mailProvider, message: error instanceof Error ? error.message : "Send failed" });
  }
});
adminRouter.get("/email-logs", async (req, res) => res.json({ logs: await EmailLog.find().sort({ createdAt: -1 }).limit(Math.min(100, Number(req.query.limit) || 50)) }));
adminRouter.post("/send-email", async (req, res) => {
  const { to, subject, html, message } = req.body;
  await sendMail(to, subject, html || layout({ title: String(subject || "Message from Bounding Curve"), body: `<p style="font-size:15px;line-height:22px;color:#334155;white-space:pre-line">${String(message || "").replace(/[&<>]/g, (c: string) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!))}</p>` }));
  res.json({ message: "Email sent" });
});
adminRouter.post("/send-bulk-email", async (req, res) => {
  const recipients = Array.isArray(req.body.recipients) ? req.body.recipients : [];
  await sendMail(recipients, req.body.subject, req.body.html || layout({ title: String(req.body.subject || "Message from Bounding Curve"), body: `<p style="font-size:15px;line-height:22px;color:#334155;white-space:pre-line">${String(req.body.message || "").replace(/[&<>]/g, (c: string) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!))}</p>` }));
  res.json({ message: "Bulk email sent", count: recipients.length });
});

contactRouter.post("/", async (req, res) => {
  const { name, email, subject = "Website contact", message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: "Name, email, and message are required" });
  await sendMail("support@boundingcurve.com", subject, `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`);
  res.status(201).json({ message: "Message sent" });
});

withdrawalsRouter.use(authenticate);
withdrawalsRouter.post("/admin/process-pending", requireAdmin, async (_req, res) => {
  const result = await Transaction.updateMany({ type: "withdrawal", status: "pending" }, { status: "processing" });
  res.json({ message: "Pending withdrawals queued", processed: result.modifiedCount });
});
withdrawalsRouter.get("/:id/status", async (req, res) => {
  const withdrawal = await Transaction.findOne({ _id: req.params.id, type: "withdrawal" });
  if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
  if (!req.user?.isAdmin && req.user?.role !== "admin" && String(withdrawal.userId) !== String(req.user?._id)) return res.status(403).json({ message: "Forbidden" });
  res.json({ status: withdrawal.status, withdrawal });
});
