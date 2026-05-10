import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { SAFETY_SYSTEM_PROMPT, SAFETY_USER_PROMPT } from "@/lib/prompts/safety";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rawText, project, reportType, reportDate } = body;

  if (!rawText) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SAFETY_SYSTEM_PROMPT,
      tools: [
        {
          name: "generate_safety_report",
          description: "Generate a structured construction safety daily report",
          input_schema: {
            type: "object" as const,
            properties: {
              date: { type: "string" },
              project: { type: "string" },
              workers_on_site: { type: "number" },
              weather: { type: "string" },
              temperature_c: { type: "number" },
              work_performed: {
                type: "string",
                description: "Detailed description of work completed today",
              },
              hazards_noted: {
                type: "array",
                items: { type: "string" },
                description: "List of specific hazards identified on site",
              },
              corrective_actions: {
                type: "string",
                description: "Actions taken to address identified hazards",
              },
              incidents: {
                type: "string",
                description: "Any incidents, near-misses, or injuries (or 'None reported')",
              },
              compliance_flags: {
                type: "array",
                items: { type: "string" },
                description: "Any items requiring regulatory notification or follow-up",
              },
            },
            required: [
              "date",
              "project",
              "workers_on_site",
              "weather",
              "temperature_c",
              "work_performed",
              "hazards_noted",
              "corrective_actions",
              "incidents",
              "compliance_flags",
            ],
          },
        },
      ],
      tool_choice: { type: "any" },
      messages: [
        {
          role: "user",
          content: `${SAFETY_USER_PROMPT(project, reportDate, reportType)}\n\nField notes:\n${rawText}`,
        },
      ],
    });

    let report = null;
    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === "generate_safety_report") {
        report = block.input;
        break;
      }
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
