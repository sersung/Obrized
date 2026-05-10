import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
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
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SCHEDULING_SYSTEM_PROMPT,
      tools: [
        {
          name: "propose_reschedule",
          description: "Propose a rescheduled project timeline after a delay",
          input_schema: {
            type: "object" as const,
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
              daysAdded: {
                type: "number",
                description: "How many days the project end date has shifted",
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of the key rescheduling decisions",
              },
            },
            required: ["updatedTasks", "affectedCount", "daysAdded", "reasoning"],
          },
        },
      ],
      tool_choice: { type: "any" },
      messages: [
        {
          role: "user",
          content: `${SCHEDULING_USER_PROMPT(delayedTask.name, delayDays)}\n\nCurrent task list:\n${JSON.stringify(tasks, null, 2)}`,
        },
      ],
    });

    let result = null;
    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === "propose_reschedule") {
        result = block.input;
        break;
      }
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
