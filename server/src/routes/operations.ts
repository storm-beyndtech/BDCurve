import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { AuditLog, EmailLog, Wallet } from "../models/Operations.js";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { sendMail } from "../services/mailer.js";

export const walletRouter = Router();
export const adminRouter = Router();
export const contactRouter = Router();
export const withdrawalsRouter = Router();

walletRouter.use(authenticate);
walletRouter.get("/all", requireAdmin, async (_req, res) => res.json({ wallets: await Wallet.find().populate("userId", "email name").sort({ createdAt: -1 }) }));

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
adminRouter.get("/email-logs", async (req, res) => res.json({ logs: await EmailLog.find().sort({ createdAt: -1 }).limit(Math.min(100, Number(req.query.limit) || 50)) }));
adminRouter.post("/send-email", async (req, res) => {
  const { to, subject, html, message } = req.body;
  await sendMail(to, subject, html || `<p>${String(message || "")}</p>`);
  await EmailLog.create({ recipients: [to], subject, sentBy: req.user!._id });
  res.json({ message: "Email sent" });
});
adminRouter.post("/send-bulk-email", async (req, res) => {
  const recipients = Array.isArray(req.body.recipients) ? req.body.recipients : [];
  await sendMail(recipients, req.body.subject, req.body.html || `<p>${String(req.body.message || "")}</p>`);
  await EmailLog.create({ recipients, subject: req.body.subject, sentBy: req.user!._id });
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
