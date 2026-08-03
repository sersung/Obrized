import { NextRequest, NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";

type EmailPayload = {
  to: string;
  subject: string;
  type: "quote" | "invoice_reminder" | "custom";
  // quote email
  quote_number?: string;
  client_name?: string;
  provider_name?: string;
  project_name?: string;
  total?: number;
  quote_url?: string;
  valid_until?: string;
  // invoice reminder
  invoice_number?: string;
  due_date?: string;
  amount_due?: number;
  // custom
  html?: string;
};

function buildQuoteHtml(p: EmailPayload) {
  const total = p.total?.toLocaleString("en-CA", { style: "currency", currency: "CAD" }) ?? "";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 32px 16px; }
  .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; }
  .logo { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 32px; }
  .logo span { color: #2563eb; }
  h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
  p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
  .total { font-size: 32px; font-weight: 800; color: #0f172a; margin: 24px 0; }
  .btn { display: inline-block; background: #2563eb; color: #fff !important; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 16px; text-decoration: none; margin: 8px 0 24px; }
  .footer { color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
</style></head>
<body>
<div class="card">
  <div class="logo">Ob<span>ri</span>zed</div>
  <h1>Quote ${p.quote_number} for ${p.project_name}</h1>
  <p>Hi ${p.client_name},</p>
  <p><strong>${p.provider_name}</strong> has sent you a quote for <strong>${p.project_name}</strong>. Please review the details and sign electronically at your convenience.</p>
  <div class="total">${total}</div>
  <p style="color:#94a3b8;font-size:13px;">Valid until ${p.valid_until ?? "30 days from today"}</p>
  <a href="${p.quote_url}" class="btn">Review &amp; Sign Quote →</a>
  <p>You can review itemized costs, payment terms, and Ontario legal terms, then sign directly in your browser — no account required.</p>
  <div class="footer">
    <p>This quote was sent via <strong>Obrized</strong> — Construction Management for Canadian Contractors.</p>
    <p>If you have questions, reply to this email or contact ${p.provider_name} directly.</p>
  </div>
</div>
</body>
</html>`;
}

function buildInvoiceReminderHtml(p: EmailPayload) {
  const amount = p.amount_due?.toLocaleString("en-CA", { style: "currency", currency: "CAD" }) ?? "";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 32px 16px; }
  .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; }
  .logo { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 32px; }
  .logo span { color: #2563eb; }
  .badge { display: inline-block; background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
  h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
  p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
  .amount { font-size: 36px; font-weight: 800; color: #dc2626; margin: 16px 0 8px; }
  .due { color: #94a3b8; font-size: 13px; }
  .footer { color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
</style></head>
<body>
<div class="card">
  <div class="logo">Ob<span>ri</span>zed</div>
  <div class="badge">⚠️ Payment Reminder</div>
  <h1>Invoice ${p.invoice_number} — Payment Due</h1>
  <p>Hi ${p.client_name},</p>
  <p>This is a friendly reminder that Invoice <strong>${p.invoice_number}</strong> is due for payment.</p>
  <div class="amount">${amount}</div>
  <p class="due">Due date: <strong>${p.due_date ?? "Immediately"}</strong></p>
  <p>Please arrange payment at your earliest convenience. As per our agreement, overdue amounts are subject to interest at 2% per month (24% per annum) under Ontario law.</p>
  <p>If you have already made this payment, please disregard this reminder.</p>
  <div class="footer">
    <p>Sent via <strong>Obrized</strong> — Construction Management for Canadian Contractors.</p>
  </div>
</div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload: EmailPayload = await req.json();

  const smtpConfigured =
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS;

  if (!smtpConfigured) {
    // Return the email content so the caller can show it or open a mailto link
    const html = payload.type === "quote"
      ? buildQuoteHtml(payload)
      : payload.type === "invoice_reminder"
        ? buildInvoiceReminderHtml(payload)
        : (payload.html ?? "<p>No content</p>");

    return NextResponse.json({
      sent: false,
      reason: "SMTP not configured — set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env",
      mailto: `mailto:${payload.to}?subject=${encodeURIComponent(payload.subject)}`,
      html,
    });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: process.env.EMAIL_PORT === "465",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const html = payload.type === "quote"
      ? buildQuoteHtml(payload)
      : payload.type === "invoice_reminder"
        ? buildInvoiceReminderHtml(payload)
        : (payload.html ?? "");

    await transporter.sendMail({
      from: `"${session.user.name ?? "Obrized"}" <${process.env.EMAIL_FROM ?? process.env.EMAIL_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html,
    });

    return NextResponse.json({ sent: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
