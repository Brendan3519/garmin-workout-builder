import { GoogleGenAI } from "@google/genai";
import { workoutJsonSchema } from "@/lib/workoutSchema";
import { parseWorkout } from "@/lib/parseWorkout";
import { renumberSteps } from "@/lib/renumberSteps";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body was not valid JSON." }, { status: 400 });
  }


  if (!(typeof body === "object" && body !== null)) return Response.json({ error: "Request body must include a non-empty 'text' string." }, { status: 400 });

  const obj = body as Record<string, unknown>;
  if (!(typeof obj.text === "string" && obj.text.trim() !== "")) return Response.json({ error: "Request body must include a non-empty 'text' string." }, { status: 400 });

  const text = obj.text;
  const prompt = `You convert a runner's plain-English workout description into a structured Garmin running workout.

    Rules:
    - Interval sets like "6x400m" become a repeat block. Inside it, put the work step first (intensity INTERVAL, using the stated distance or time), then a recovery step (intensity RECOVERY). repeatValue is the number of reps.
    - If the recovery isn't specified, use 60 seconds.
    - If a total time is given along with intervals (e.g. "40 min run with 6x400m"), the intervals happen inside that total: start with an easy warmup (WARMUP) and end with an easy cooldown (COOLDOWN), sized so the whole workout comes to roughly the stated total.
    - Only add a pace or heart-rate target if the description gives one. Never invent targets.
    - workoutName should be short, like "6x400m Intervals".

Workout description: ${text}`;

  let outputText: string;
  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: workoutJsonSchema,
      },
    });
    outputText = interaction.output_text ?? "";
  } catch (err) {
    console.error("Gemini call failed:", err);
    return Response.json({ error: "Service call failed." }, { status: 502 });
  }

  const result = parseWorkout(outputText);


  if (!result.ok) {
    console.error("Parse failed:", result.error, outputText);
    return Response.json({ error: result.error }, { status: 502 });
  }

  return Response.json({ workout: { ...result.workout, steps: renumberSteps(result.workout.steps) } });
}