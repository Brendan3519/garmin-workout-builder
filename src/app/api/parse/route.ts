import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  const body: unknown = await request.json();

  if (!(typeof body === "object" && body !== null)) return Response.json({ error: "Request body must include a non-empty 'text' string." }, { status: 400 });

  const obj = body as Record<string, unknown>;
  if (!(typeof obj.text === "string" && obj.text.trim() !== "")) return Response.json({ error: "Request body must include a non-empty 'text' string." }, { status: 400 });

  const text = obj.text;

  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: `Convert this running workout description into JSON: ${text}`,
    generation_config: {
      thinking_level: "low",
    },
  });

  return Response.json({ raw: interaction.output_text });
}