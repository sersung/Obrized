import { NextRequest, NextResponse } from "next/server";
import { genAI, MODEL, FunctionCallingMode } from "@/lib/gemini";
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

    const model = genAI.getGenerativeModel({ model: MODEL });

    const geminiResult = await model.generateContent({
      systemInstruction: PAYMENTS_SYSTEM_PROMPT,
      contents: [
        {
          role: "user",
          parts: [{ text: `${PAYMENTS_USER_PROMPT(province)}\n\nInvoice data:\n${JSON.stringify(invoiceData, null, 2)}` }],
        },
      ],
      tools: [
        {
          functionDeclarations: [
            {
              name: "validate_proper_invoice",
              description: "Validate whether this invoice qualifies as a 'proper invoice' under Canadian Prompt Payment legislation",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              parameters: {
                type: "object",
                properties: {
                  is_proper_invoice: { type: "boolean", description: "Whether this is a valid proper invoice" },
                  compliance_score: { type: "number", description: "Compliance score 0-100" },
                  issues: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        field: { type: "string" },
                        issue: { type: "string" },
                        legislation: { type: "string", description: "Specific legislation reference" },
                      },
                      required: ["field", "issue", "legislation"],
                    },
                  },
                },
                required: ["is_proper_invoice", "compliance_score", "issues"],
              } as any,
            },
          ],
        },
      ],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY } },
      generationConfig: { maxOutputTokens: 2048 },
    });

    let result = null;
    for (const candidate of geminiResult.response.candidates ?? []) {
      for (const part of candidate.content.parts) {
        if (part.functionCall && part.functionCall.name === "validate_proper_invoice") {
          result = part.functionCall.args;
          break;
        }
      }
      if (result) break;
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
