import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

// Initialize Stripe backend SDK safely
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, billing } = await req.json();
    if (!plan || !billing) {
      return NextResponse.json({ error: "Missing plan or billing parameter" }, { status: 400 });
    }

    const email = session.user.email;
    const isMock = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "mock_key" || process.env.STRIPE_SECRET_KEY === "" || process.env.STRIPE_SECRET_KEY === "sk_test_dummy";

    if (isMock) {
      // Offline Mock Checkout Flow
      // Directly update the profile in Supabase to simulate webhook response
      const { data: profile } = await supabase
        .from("profiles")
        .select()
        .eq("email", email)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            plan_name: plan,
            billing_cycle: billing,
            subscription_status: "active",
            stripe_customer_id: "cus_mock123",
            stripe_subscription_id: "sub_mock_" + Math.random().toString(36).slice(2, 6),
          })
          .eq("email", email);
      }

      const mockSuccessUrl = `/settings?stripe_mock_success=true&plan=${plan}&billing=${billing}`;
      return NextResponse.json({ url: mockSuccessUrl });
    }

    // Real Stripe Checkout Flow
    let priceId = "";
    if (plan === "Starter") {
      priceId = billing === "annually" 
        ? process.env.STRIPE_PRICE_STARTER_ANNUAL || "" 
        : process.env.STRIPE_PRICE_STARTER_MONTHLY || "";
    } else if (plan === "Pro") {
      priceId = billing === "annually" 
        ? process.env.STRIPE_PRICE_PRO_ANNUAL || "" 
        : process.env.STRIPE_PRICE_PRO_MONTHLY || "";
    }

    if (!priceId) {
      return NextResponse.json({ error: "Price ID not configured in environment variables" }, { status: 400 });
    }

    const origin = req.nextUrl.origin;

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${origin}/settings?stripe_success=true&plan=${plan}&billing=${billing}`,
      cancel_url: `${origin}/settings?stripe_cancel=true`,
      metadata: {
        user_email: email,
        plan_name: plan,
        billing_cycle: billing,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Error in Stripe checkout:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
