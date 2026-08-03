import { NextRequest, NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoice_id } = await req.json();
  if (!invoice_id) return NextResponse.json({ error: "invoice_id required" }, { status: 400 });

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoice_id)
    .eq("user_email", session.user.email)
    .single();

  if (error || !invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "paid") return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const isMock = !stripeKey || stripeKey === "sk_test_dummy" || stripeKey.startsWith("sk_test_dummy");

  if (isMock) {
    // Mock mode: simulate payment link
    const mockUrl = `${req.nextUrl.origin}/payments?mock_paid=${invoice_id}`;
    return NextResponse.json({ url: mockUrl, mock: true });
  }

  const stripe = new Stripe(stripeKey!);
  const origin = req.nextUrl.origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: `Invoice ${invoice.invoice_number} — ${invoice.project_name}`,
            description: `Payment for services rendered — ${invoice.province}`,
          },
          unit_amount: Math.round(invoice.total * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "invoice_payment",
      invoice_id,
      user_email: session.user.email,
    },
    customer_email: undefined,
    success_url: `${origin}/payments?paid=${invoice_id}`,
    cancel_url: `${origin}/payments`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
