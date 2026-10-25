import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { EmailLog } from "../models/Operations.js";

/**
 * Email delivery.
 * - Provider: Resend (HTTPS API) when RESEND_API_KEY is set, otherwise SMTP (nodemailer).
 * - sendMail(): awaits delivery and throws on failure (use when the caller must know, e.g. OTP codes).
 * - queueMail(): fire-and-forget with retries + logging; never throws (use for notifications).
 */
const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
export const mailProvider: "resend" | "smtp" | "none" = env.RESEND_API_KEY ? "resend" : smtpConfigured ? "smtp" : "none";
export const mailConfigured = mailProvider !== "none";
const FROM = env.MAIL_FROM || env.SMTP_FROM;

const transporter = mailProvider === "smtp"
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      // Port 465 requires implicit TLS; 587/2525 use STARTTLS. Infer when SMTP_SECURE was not set correctly.
      secure: env.SMTP_PORT === 465 ? true : env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
  : null;

if (mailProvider === "none") console.warn("[mail] No email provider configured (set RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASSWORD). Emails will NOT be sent.");
else console.info(`[mail] provider=${mailProvider} from=${FROM}`);

const list = (to: string | string[]) => (Array.isArray(to) ? to : [to]).map((t) => String(t || "").trim()).filter(Boolean);

async function deliver(to: string[], subject: string, html: string, text?: string) {
  if (mailProvider === "resend") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html, ...(text ? { text } : {}) }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
    if (!response.ok) throw new Error(`Resend ${response.status}: ${body.message || body.name || "request failed"}`);
    return { messageId: body.id || "resend" };
  }
  if (transporter) {
    const info = await transporter.sendMail({ from: FROM, to, subject, html, ...(text ? { text } : {}) });
    return { messageId: info.messageId };
  }
  throw new Error("Email service is not configured (set RESEND_API_KEY or SMTP_* secrets)");
}

export async function sendMail(to: string | string[], subject: string, html: string, text?: string) {
  const recipients = list(to);
  if (!recipients.length) throw new Error("No email recipients");
  if (!mailConfigured && env.NODE_ENV !== "production") {
    console.info(`[mail disabled] ${subject} -> ${recipients.join(", ")}`);
    return { messageId: "development-noop" };
  }
  try {
    const result = await deliver(recipients, subject, html, text);
    void EmailLog.create({ recipients, subject, status: "sent" }).catch(() => undefined);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[mail] FAILED "${subject}" -> ${recipients.length} recipient(s): ${message}`);
    void EmailLog.create({ recipients, subject, status: "failed", error: message.slice(0, 500) }).catch(() => undefined);
    throw error;
  }
}

/** Non-blocking send with up to 3 attempts (0s, 5s, 30s). Never throws; failures are logged + recorded in EmailLog. */
export function queueMail(to: string | string[], subject: string, html: string, text?: string) {
  const recipients = list(to);
  if (!recipients.length) return;
  const delays = [0, 5_000, 30_000];
  const attempt = (i: number) => {
    setTimeout(() => {
      sendMail(recipients, subject, html, text).catch(() => {
        if (i + 1 < delays.length) attempt(i + 1);
        else console.error(`[mail] giving up on "${subject}" after ${delays.length} attempts`);
      });
    }, delays[i]).unref?.();
  };
  attempt(0);
}

export const adminNotifyEmails = () =>
  [...new Set((env.ADMIN_NOTIFY_EMAILS || env.ADMIN_EMAILS || process.env.ADMIN_SEED_EMAIL || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean))];
