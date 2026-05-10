import { NextRequest } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { ESTIMATING_SYSTEM_PROMPT, ESTIMATING_USER_PROMPT } from "@/lib/prompts/estimating";

function sse(data: object) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const projectName = formData.get("projectName") as string;
  const province = formData.get("province") as string;

  if (!file) {
    return new Response("No file provided", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(sse({ type: "log", message: "📄 Lendo arquivo PDF..." })));

        // Read PDF as base64 for Claude Vision
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        controller.enqueue(
          encoder.encode(sse({ type: "log", message: "🤖 Analisando planta com Claude Vision..." }))
        );

        // Call Claude with tool use for structured extraction
        const response = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 8192,
          system: ESTIMATING_SYSTEM_PROMPT,
          tools: [
            {
              name: "record_quantity",
              description: "Record an extracted construction quantity from the blueprint",
              input_schema: {
                type: "object" as const,
                properties: {
                  csi_code: {
                    type: "string",
                    description: "CSI MasterFormat division code (e.g. 03 30 00)",
                  },
                  description: {
                    type: "string",
                    description: "Description of the construction element",
                  },
                  quantity: { type: "number", description: "Numeric quantity" },
                  unit: {
                    type: "string",
                    description: "Unit of measure (m², m, each, kg, etc.)",
                  },
                  unit_price: {
                    type: "number",
                    description: "Estimated unit price in CAD",
                  },
                  material_cost: {
                    type: "number",
                    description: "Total material cost in CAD",
                  },
                  labour_hours: {
                    type: "number",
                    description: "Estimated labour hours for installation",
                  },
                },
                required: [
                  "csi_code",
                  "description",
                  "quantity",
                  "unit",
                  "unit_price",
                  "material_cost",
                  "labour_hours",
                ],
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
                    media_type: file.type as "application/pdf",
                    data: base64,
                  },
                },
                {
                  type: "text",
                  text: ESTIMATING_USER_PROMPT(province),
                },
              ],
            },
          ],
        });

        let itemCount = 0;
        for (const block of response.content) {
          if (block.type === "tool_use" && block.name === "record_quantity") {
            itemCount++;
            controller.enqueue(
              encoder.encode(
                sse({
                  type: "log",
                  message: `✓ Item ${itemCount}: ${(block.input as { description: string }).description}`,
                })
              )
            );
            controller.enqueue(
              encoder.encode(
                sse({
                  type: "item",
                  item: block.input,
                })
              )
            );
          }
        }

        controller.enqueue(
          encoder.encode(
            sse({
              type: "done",
              totalItems: itemCount,
            })
          )
        );
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            sse({
              type: "error",
              message: error instanceof Error ? error.message : "Unknown error",
            })
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
