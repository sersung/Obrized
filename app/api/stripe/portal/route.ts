import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

// Initialize Stripe backend SDK safely
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
const stripe = new Stripe(stripeKey);

// Keys that indicate offline/dummy mode
const isDummyKey = (key: string) =>
  !key || key === "sk_test_dummy" || key === "mock_key" || key === "";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const isMock = isDummyKey(stripeKey);
    const origin = req.nextUrl.origin;

    // Offline sandbox: return mock portal redirect immediately
    if (isMock) {
      return NextResponse.json({ url: `/settings?stripe_mock_portal=true` });
    }

    // Query active profile to get the stripe_customer_id
    const { data: profile } = await supabase
      .from("profiles")
      .select()
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    let stripeCustomerId: string = profile.stripe_customer_id;

    // ── Auto-provision: if the stored customer ID is a mock or missing, create a real one ──
    const isMockCustomer =
      !stripeCustomerId ||
      stripeCustomerId.startsWith("cus_mock") ||
      stripeCustomerId === "";

    if (isMockCustomer) {
      // Create a real Stripe customer for this user
      try {
        const customer = await stripe.customers.create({
          email: email,
          name: session.user.name || undefined,
          metadata: { obrized_user_email: email },
        });
        stripeCustomerId = customer.id;

        // Persist the new real customer ID back to the profile
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("email", email);
      } catch (createErr: unknown) {
        console.error("Failed to auto-provision Stripe customer:", createErr);
        // Graceful fallback: send user to settings with an error notice
        return NextResponse.json({
          url: `${origin}/settings?portal_error=no_subscription`,
        });
      }
    }

    // Create Stripe Customer Billing Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in Stripe portal:", error);

    // Instead of a hard 500, redirect to settings with an error param (better UX)
    const origin = req.nextUrl.origin;
    return NextResponse.json({
      url: `${origin}/settings?portal_error=stripe_error`,
      error: message,
    }, { status: 200 }); // Return 200 so frontend can redirect to the error page gracefully
  }
}
