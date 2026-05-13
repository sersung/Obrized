import { NextRequest } from "next/server";
import { genAI, MODEL, FunctionCallingMode } from "@/lib/gemini";
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
          encoder.encode(sse({ type: "log", message: "🤖 Analisando planta com Gemini Vision..." }))
        );

        const geminiModel = genAI.getGenerativeModel({ model: MODEL });

        const result = await geminiModel.generateContent({
          systemInstruction: ESTIMATING_SYSTEM_PROMPT,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { data: base64, mimeType: "application/pdf" } },
                { text: ESTIMATING_USER_PROMPT(province) },
              ],
            },
          ],
          tools: [
            {
              functionDeclarations: [
                {
                  name: "record_quantity",
                  description: "Record an extracted construction quantity from the blueprint",
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  parameters: {
                    type: "object",
                    properties: {
                      csi_code: { type: "string", description: "CSI MasterFormat division code (e.g. 03 30 00)" },
                      description: { type: "string", description: "Description of the construction element" },
                      quantity: { type: "number", description: "Numeric quantity" },
                      unit: { type: "string", description: "Unit of measure (m², m, each, kg, etc.)" },
                      unit_price: { type: "number", description: "Estimated unit price in CAD" },
                      material_cost: { type: "number", description: "Total material cost in CAD" },
                      labour_hours: { type: "number", description: "Estimated labour hours for installation" },
                    },
                    required: ["csi_code", "description", "quantity", "unit", "unit_price", "material_cost", "labour_hours"],
                  } as any,
                },
              ],
            },
          ],
          toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
          generationConfig: { maxOutputTokens: 8192 },
        });

        let itemCount = 0;
        for (const candidate of result.response.candidates ?? []) {
          for (const part of candidate.content.parts) {
            if (part.functionCall && part.functionCall.name === "record_quantity") {
              itemCount++;
              controller.enqueue(
                encoder.encode(
                  sse({
                    type: "log",
                    message: `✓ Item ${itemCount}: ${(part.functionCall.args as { description: string }).description}`,
                  })
                )
              );
              controller.enqueue(
                encoder.encode(
                  sse({
                    type: "item",
                    item: part.functionCall.args,
                  })
                )
              );
            }
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
