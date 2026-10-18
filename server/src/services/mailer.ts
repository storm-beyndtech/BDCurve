import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const mailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);

const transporter = mailConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    })
  : null;

export async function sendMail(to: string | string[], subject: string, html: string) {
  if (!transporter) {
    if (env.NODE_ENV === "production") throw new Error("Email service is not configured");
    console.info(`[mail disabled] ${subject} -> ${Array.isArray(to) ? to.join(", ") : to}`);
    return { messageId: "development-noop" };
  }
  return transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
}
