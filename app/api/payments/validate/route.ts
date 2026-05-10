import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { PAYMENTS_SYSTEM_PROMPT, PAYMENTS_USER_PROMPT } from "@/lib/prompts/payments";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    province,
    invoiceNumber,
    project,
    periodStart,
    periodEnd,
    items,
    wsibUploaded,
    lienWaiverUploaded,
    subtotal,
    total,
  } = body;

  try {
    const invoiceData = {
      invoiceNumber,
      project,
      province,
      billingPeriod: periodStart && periodEnd ? `${periodStart} to ${periodEnd}` : "NOT PROVIDED",
      lineItems: items,
      subtotal: `CAD ${subtotal}`,
      total: `CAD ${total}`,
      wsibClearanceUploaded: wsibUploaded,
      lienWaiversUploaded: lienWaiverUploaded,
    };

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: PAYMENTS_SYSTEM_PROMPT,
      tools: [
        {
          name: "validate_proper_invoice",
          description: "Validate whether this invoice qualifies as a 'proper invoice' under Canadian Prompt Payment legislation",
          input_schema: {
            type: "object" as const,
            properties: {
              is_proper_invoice: {
                type: "boolean",
                description: "Whether this is a valid proper invoice",
              },
              compliance_score: {
                type: "number",
                description: "Compliance score 0-100",
              },
              issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string" },
                    issue: { type: "string" },
                    legislation: {
                      type: "string",
                      description: "Specific legislation reference",
                    },
                  },
                  required: ["field", "issue", "legislation"],
                },
              },
            },
            required: ["is_proper_invoice", "compliance_score", "issues"],
          },
        },
      ],
      tool_choice: { type: "any" },
      messages: [
        {
          role: "user",
          content: `${PAYMENTS_USER_PROMPT(province)}\n\nInvoice data:\n${JSON.stringify(invoiceData, null, 2)}`,
        },
      ],
    });

    let result = null;
    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === "validate_proper_invoice") {
        result = block.input;
        break;
      }
    }

    if (!result) {
      return NextResponse.json({ error: "Validation failed" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment validation error:", error);
    return NextResponse.json(
      { error: "Validation failed. Check your API key." },
      { status: 500 }
    );
  }
}
