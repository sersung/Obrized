import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { CONTRACT_SYSTEM_PROMPT, CONTRACT_USER_PROMPT } from "@/lib/prompts/contracts";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const contractType = (formData.get("contractType") as string) || "CCDC-2";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: CONTRACT_SYSTEM_PROMPT,
      tools: [
        {
          name: "flag_risky_clause",
          description: "Flag a risky or non-standard clause in the construction contract",
          input_schema: {
            type: "object" as const,
            properties: {
              clause_number: { type: "string" },
              clause_title: { type: "string" },
              original_text: { type: "string", description: "The exact clause text" },
              risk_level: {
                type: "string",
                enum: ["low", "medium", "high", "critical"],
              },
              risk_reason: {
                type: "string",
                description: "Clear explanation of why this is risky for the contractor",
              },
              suggested_text: {
                type: "string",
                description: "Suggested alternative language (redline)",
              },
              category: {
                type: "string",
                enum: [
                  "payment",
                  "liability",
                  "indemnity",
                  "dispute",
                  "delay",
                  "termination",
                  "warranty",
                ],
              },
            },
            required: [
              "clause_number",
              "clause_title",
              "original_text",
              "risk_level",
              "risk_reason",
              "category",
            ],
          },
        },
        {
          name: "provide_summary",
          description: "Provide an overall risk summary for the contract",
          input_schema: {
            type: "object" as const,
            properties: {
              overall_risk: {
                type: "string",
                enum: ["low", "medium", "high", "critical"],
              },
              summary: {
                type: "string",
                description: "Executive summary of the contract risk assessment",
              },
            },
            required: ["overall_risk", "summary"],
          },
        },
      ],
      tool_choice: { type: "auto" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: CONTRACT_USER_PROMPT(contractType),
            },
          ],
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clauses: any[] = [];
    let summary = { overall_risk: "medium", summary: "Contract analysis complete." };

    for (const block of response.content) {
      if (block.type === "tool_use") {
        if (block.name === "flag_risky_clause") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          clauses.push(block.input as any);
        } else if (block.name === "provide_summary") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          summary = block.input as any;
        }
      }
    }

    return NextResponse.json({
      overall_risk: summary.overall_risk,
      summary: summary.summary,
      clauses,
    });
  } catch (error) {
    console.error("Contract analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Check your API key." },
      { status: 500 }
    );
  }
}
