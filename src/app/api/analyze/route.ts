import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Hardcoded fallback — ensures the dashboard always works, even when */
/* no GEMINI_API_KEY is configured or the API quota is exhausted.     */
/* ------------------------------------------------------------------ */
const FALLBACK_ANALYSIS = {
  impactSummary:
    "The projected storm surge is likely to flood the Coastal Substation. If it fails, the City Hospital will lose primary power within hours. Families in Ward 4 should move to the community shelter by tomorrow morning.",
  actions: [
    {
      id: "sandbags",
      label: "Dispatch sandbags to Coastal Substation",
      tag: "Power grid",
    },
    {
      id: "generator",
      label: "Alert City Hospital backup generator team",
      tag: "Hospital",
    },
    {
      id: "shelter",
      label: "Open Ward 4 community shelter",
      tag: "Shelter",
    },
  ],
  generatedAt: new Date().toISOString(),
  model: "fallback",
};

/**
 * POST /api/analyze
 *
 * Accepts cyclone telemetry + infrastructure data and sends them to
 * Google Gemini to generate an impact summary and action checklist.
 *
 * Request body: { telemetry: TelemetryObject, infrastructure: MapAsset[] }
 * Response:     { impactSummary: string, actions: ActionItem[], generatedAt, model }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      telemetry?: Record<string, unknown>;
      infrastructure?: Record<string, unknown>[];
    };

    const { telemetry, infrastructure } = body;
    if (!telemetry || !infrastructure) {
      return NextResponse.json(
        { ok: false, error: "telemetry and infrastructure are required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[senseit] GEMINI_API_KEY not configured — using fallback analysis");
      return NextResponse.json(FALLBACK_ANALYSIS);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let text = "";
    let usedModel = "fallback";

    const MODELS_TO_TRY = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-3.8-flash"];

    const prompt = `You are a disaster management AI. Based on the following cyclone telemetry and list of exposed infrastructure, generate a brief "Impact Summary" (3 sentences max) and a 3-item "Required Actions" checklist to prevent cascading failures.

Cyclone Telemetry:
${JSON.stringify(telemetry, null, 2)}

Exposed Infrastructure:
${JSON.stringify(infrastructure, null, 2)}

Respond in **strict JSON** matching this schema (no markdown fences, no commentary):
{
  "impactSummary": "...",
  "actions": [
    { "id": "action_1", "label": "...", "tag": "..." },
    { "id": "action_2", "label": "...", "tag": "..." },
    { "id": "action_3", "label": "...", "tag": "..." }
  ]
}

Where "tag" is a very short category like "Power grid", "Hospital", or "Shelter".`;

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        text = result.response.text();
        usedModel = modelName;
        if (text) break;
      } catch (err) {
        console.warn(`[senseit] ${modelName} failed:`, (err as Error).message?.slice(0, 120));
        continue;
      }
    }

    if (!text) {
      return NextResponse.json(FALLBACK_ANALYSIS);
    }

    // Strip markdown code fences if the model wraps the JSON
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let parsed: { impactSummary: string; actions: { id: string; label: string; tag: string }[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("[senseit] Gemini returned non-JSON:", text);
      return NextResponse.json(FALLBACK_ANALYSIS);
    }

    return NextResponse.json({
      impactSummary: parsed.impactSummary,
      actions: parsed.actions,
      generatedAt: new Date().toISOString(),
      model: usedModel,
    });
  } catch (err) {
    console.error("[senseit] /api/analyze error:", err);
    return NextResponse.json(FALLBACK_ANALYSIS);
  }
}
