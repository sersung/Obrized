import { NextRequest, NextResponse } from "next/server";
import { genAI, MODEL, FunctionCallingMode } from "@/lib/gemini";
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

    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent({
      systemInstruction: CONTRACT_SYSTEM_PROMPT,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64, mimeType: "application/pdf" } },
            { text: CONTRACT_USER_PROMPT(contractType) },
          ],
        },
      ],
      tools: [
        {
          functionDeclarations: [
            {
              name: "flag_risky_clause",
              description: "Flag a risky or non-standard clause in the construction contract",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              parameters: {
                type: "object",
                properties: {
                  clause_number: { type: "string" },
                  clause_title: { type: "string" },
                  original_text: { type: "string", description: "The exact clause text" },
                  risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  risk_reason: { type: "string", description: "Clear explanation of why this is risky for the contractor" },
                  suggested_text: { type: "string", description: "Suggested alternative language (redline)" },
                  category: {
                    type: "string",
                    enum: ["payment", "liability", "indemnity", "dispute", "delay", "termination", "warranty"],
                  },
                },
                required: ["clause_number", "clause_title", "original_text", "risk_level", "risk_reason", "category"],
              } as any,
            },
            {
              name: "provide_summary",
              description: "Provide an overall risk summary for the contract",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              parameters: {
                type: "object",
                properties: {
                  overall_risk: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  summary: { type: "string", description: "Executive summary of the contract risk assessment" },
                },
                required: ["overall_risk", "summary"],
              } as any,
            },
          ],
        },
      ],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
      generationConfig: { maxOutputTokens: 8192 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clauses: any[] = [];
    let summary = { overall_risk: "medium", summary: "Contract analysis complete." };

    const response = result.response;
    for (const candidate of response.candidates ?? []) {
      for (const part of candidate.content.parts) {
        if (part.functionCall) {
          if (part.functionCall.name === "flag_risky_clause") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clauses.push(part.functionCall.args as any);
          } else if (part.functionCall.name === "provide_summary") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            summary = part.functionCall.args as any;
          }
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
