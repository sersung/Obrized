import { NextRequest, NextResponse } from "next/server";
import { genAI, MODEL, FunctionCallingMode } from "@/lib/gemini";
import { SAFETY_SYSTEM_PROMPT, SAFETY_USER_PROMPT } from "@/lib/prompts/safety";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rawText, project, reportType, reportDate } = body;

  if (!rawText) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const geminiResult = await model.generateContent({
      systemInstruction: SAFETY_SYSTEM_PROMPT,
      contents: [
        {
          role: "user",
          parts: [{ text: `${SAFETY_USER_PROMPT(project, reportDate, reportType)}\n\nField notes:\n${rawText}` }],
        },
      ],
      tools: [
        {
          functionDeclarations: [
            {
              name: "generate_safety_report",
              description: "Generate a structured construction safety daily report",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              parameters: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  project: { type: "string" },
                  workers_on_site: { type: "number" },
                  weather: { type: "string" },
                  temperature_c: { type: "number" },
                  work_performed: { type: "string", description: "Detailed description of work completed today" },
                  hazards_noted: { type: "array", items: { type: "string" }, description: "List of specific hazards identified on site" },
                  corrective_actions: { type: "string", description: "Actions taken to address identified hazards" },
                  incidents: { type: "string", description: "Any incidents, near-misses, or injuries (or 'None reported')" },
                  compliance_flags: { type: "array", items: { type: "string" }, description: "Any items requiring regulatory notification" },
                },
                required: ["date", "project", "workers_on_site", "weather", "temperature_c", "work_performed", "hazards_noted", "corrective_actions", "incidents", "compliance_flags"],
              } as any,
            },
          ],
        },
      ],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY } },
      generationConfig: { maxOutputTokens: 4096 },
    });

    let report = null;
    for (const candidate of geminiResult.response.candidates ?? []) {
      for (const part of candidate.content.parts) {
        if (part.functionCall && part.functionCall.name === "generate_safety_report") {
          report = part.functionCall.args;
          break;
        }
      }
      if (report) break;
    }

    if (!report) {
      return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Safety report error:", error);
    return NextResponse.json(
      { error: "Generation failed. Check your API key." },
      { status: 500 }
    );
  }
}
