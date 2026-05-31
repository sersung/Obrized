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

    const email = session.user.email;
    const isMock = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "mock_key" || process.env.STRIPE_SECRET_KEY === "" || process.env.STRIPE_SECRET_KEY === "sk_test_dummy";

    // Query active profile to get the stripe_customer_id
    const { data: profile } = await supabase
      .from("profiles")
      .select()
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (isMock) {
      // Offline Mock Portal redirect
      const mockPortalUrl = `/settings?stripe_mock_portal=true`;
      return NextResponse.json({ url: mockPortalUrl });
    }

    const stripeCustomerId = profile.stripe_customer_id;
    if (!stripeCustomerId) {
      return NextResponse.json({ error: "No active Stripe customer record found for this profile" }, { status: 400 });
    }

    const origin = req.nextUrl.origin;

    // Create Stripe Customer Billing Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Error in Stripe portal:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
