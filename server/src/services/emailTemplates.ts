import { env } from "../config/env.js";

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export const SUPPORT_PHONE = "+1 (606) 913-4456";
const BLUE = "#2563eb";

/** Restrained branded layout (inline styles for email clients). */
export function layout(opts: { title: string; intro?: string; rows?: [string, string][]; body?: string; cta?: { label: string; url: string }; footnote?: string }) {
  const rows = (opts.rows || []).map(([k, v]) => `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;width:40%">${esc(k)}</td><td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;word-break:break-all">${esc(v)}</td></tr>`).join("");
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
<tr><td style="padding:20px 24px;border-bottom:3px solid ${BLUE}"><span style="font-size:18px;font-weight:700;color:#0f172a">Bounding <span style="color:${BLUE}">Curve</span></span></td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 12px;font-size:20px;color:#0f172a">${esc(opts.title)}</h1>
${opts.intro ? `<p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#334155">${esc(opts.intro)}</p>` : ""}
${opts.body || ""}
${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">${rows}</table>` : ""}
${opts.cta ? `<p style="margin:20px 0"><a href="${esc(opts.cta.url)}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px">${esc(opts.cta.label)}</a></p>` : ""}
${opts.footnote ? `<p style="margin:16px 0 0;font-size:13px;line-height:20px;color:#64748b">${esc(opts.footnote)}</p>` : ""}
</td></tr>
<tr><td style="padding:16px 24px;background:#f8fafc;font-size:12px;line-height:18px;color:#64748b">Questions? Call ${SUPPORT_PHONE} or reply to support@boundingcurve.com.<br/>&copy; ${new Date().getFullYear()} Bounding Curve</td></tr>
</table></td></tr></table></body></html>`;
}

export function codeEmail(code: string, purpose: "registration" | "password-reset") {
  const isReg = purpose === "registration";
  return {
    subject: `Your Bounding Curve ${isReg ? "verification" : "password reset"} code`,
    html: layout({
      title: isReg ? "Verify your email" : "Reset your password",
      intro: `Use this code to ${isReg ? "finish creating your account" : "reset your password"}. It expires in 10 minutes.`,
      body: `<p style="margin:8px 0 16px;font-size:30px;letter-spacing:8px;font-weight:700;color:#0f172a">${esc(code)}</p>`,
      footnote: "If you did not request this, you can ignore this email.",
    }),
    text: `Your Bounding Curve code is ${code}. It expires in 10 minutes.`,
  };
}

export const appUrl = (path: string) => `${env.APP_URL.replace(/\/$/, "")}${path}`;
