import { NextRequest, NextResponse } from "next/server";
import { genAI, MODEL, FunctionCallingMode } from "@/lib/gemini";
import { SCHEDULING_SYSTEM_PROMPT, SCHEDULING_USER_PROMPT } from "@/lib/prompts/scheduling";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tasks, delayedTaskId, delayDays } = body;

  if (!tasks || !delayedTaskId) {
    return NextResponse.json({ error: "Missing tasks or delayedTaskId" }, { status: 400 });
  }

  const delayedTask = tasks.find((t: { id: string }) => t.id === delayedTaskId);
  if (!delayedTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const geminiResult = await model.generateContent({
      systemInstruction: SCHEDULING_SYSTEM_PROMPT,
      contents: [
        {
          role: "user",
          parts: [{ text: `${SCHEDULING_USER_PROMPT(delayedTask.name, delayDays)}\n\nCurrent task list:\n${JSON.stringify(tasks, null, 2)}` }],
        },
      ],
      tools: [
        {
          functionDeclarations: [
            {
              name: "propose_reschedule",
              description: "Propose a rescheduled project timeline after a delay",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              parameters: {
                type: "object",
                properties: {
                  updatedTasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        planned_start: { type: "string" },
                        planned_end: { type: "string" },
                        is_critical: { type: "boolean" },
                        status: { type: "string" },
                      },
                      required: ["id", "planned_start", "planned_end"],
                    },
                  },
                  affectedCount: { type: "number" },
                  daysAdded: { type: "number", description: "How many days the project end date has shifted" },
                  reasoning: { type: "string", description: "Brief explanation of the key rescheduling decisions" },
                },
                required: ["updatedTasks", "affectedCount", "daysAdded", "reasoning"],
              } as any,
            },
          ],
        },
      ],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY } },
      generationConfig: { maxOutputTokens: 4096 },
    });

    let result = null;
    for (const candidate of geminiResult.response.candidates ?? []) {
      for (const part of candidate.content.parts) {
        if (part.functionCall && part.functionCall.name === "propose_reschedule") {
          result = part.functionCall.args;
          break;
        }
      }
      if (result) break;
    }

    if (!result) {
      return NextResponse.json({ error: "No schedule proposed" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scheduling optimize error:", error);
    return NextResponse.json(
      { error: "Optimization failed. Check your API key." },
      { status: 500 }
    );
  }
}
