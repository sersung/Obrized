import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

// Initialize Stripe safely
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const session = event.data.object as any;

    // Handle subscription event states
    switch (event.type) {
      case "checkout.session.completed": {
        const userEmail = session.metadata?.user_email;
        const planName = session.metadata?.plan_name;
        const billingCycle = session.metadata?.billing_cycle;
        const stripeCustomerId = session.customer;
        const stripeSubscriptionId = session.subscription;

        if (userEmail) {
          await supabase
            .from("profiles")
            .update({
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
              plan_name: planName,
              billing_cycle: billingCycle,
              subscription_status: "active",
            })
            .eq("email", userEmail);
        }
        break;
      }
      case "customer.subscription.updated": {
        const stripeCustomerId = session.customer;
        const status = session.status;
        const priceId = session.items.data[0]?.price.id;

        // Map Price ID to plan name
        let planName: "Free" | "Starter" | "Pro" = "Starter";
        let billingCycle: "monthly" | "annually" = "monthly";

        if (priceId === process.env.STRIPE_PRICE_STARTER_ANNUAL) {
          planName = "Starter";
          billingCycle = "annually";
        } else if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) {
          planName = "Starter";
          billingCycle = "monthly";
        } else if (priceId === process.env.STRIPE_PRICE_PRO_ANNUAL) {
          planName = "Pro";
          billingCycle = "annually";
        } else if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) {
          planName = "Pro";
          billingCycle = "monthly";
        }

        await supabase
          .from("profiles")
          .update({
            plan_name: status === "active" ? planName : "Free",
            billing_cycle: billingCycle,
            subscription_status: status,
          })
          .eq("stripe_customer_id", stripeCustomerId);
        break;
      }
      case "customer.subscription.deleted": {
        const stripeCustomerId = session.customer;
        await supabase
          .from("profiles")
          .update({
            plan_name: "Free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("stripe_customer_id", stripeCustomerId);
        break;
      }
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error in webhook route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
