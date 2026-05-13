import { GoogleGenerativeAI, SchemaType, FunctionCallingMode } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const MODEL = "gemini-2.0-flash";
export { SchemaType, FunctionCallingMode };
