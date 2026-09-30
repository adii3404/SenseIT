import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const SYSTEM_CONTEXT = `You are SenseIT AI, the emergency operations intelligence assistant for the SenseIT Disaster Surveillance Management platform (Integrated Emergency Operations Network · Cyclone Surveillance Wing).
Current active cyclone event:
- Cyclone Name: Dana-3
- Classification: Severe Cyclonic Storm
- Location: Bay of Bengal, heading toward Odisha / Gopalpur coast
- Current sustained winds: 145 km/h, gusts to 165 km/h
- Key critical assets at risk:
  1. City General Hospital (48,000 population served, backup generator lasts ~18 hours if grid fails)
  2. Ward 4 Riverside Clinic (inside projected flood zone, evacuation recommended)
  3. Coastal Substation Alpha (supplies City Hospital; 3.2m storm surge threatens switchyard)
  4. Grid Relay Station B (secondary feeder, vulnerable to high winds and salt spray)

Provide authoritative, calm, highly structured, concise, and tactical responses. Focus on public safety, emergency power routing, evacuation logistics, medical readiness, and cyclone tracking. Keep responses under 4 sentences or a few bullet points unless deep technical details are explicitly asked.`;

const MODELS_TO_TRY = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-3.8-flash"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body as { message: string };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply:
          "SenseIT AI Fallback: Monitoring Cyclone Dana-3. Priority: sandbag deployment at Coastal Substation Alpha and backup generator fuel at City General Hospital.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const userPrompt = `${SYSTEM_CONTEXT}\n\nUser Question: ${message}`;
    let replyText = "";

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(userPrompt);
        replyText = result.response.text();
        if (replyText) break;
      } catch (err) {
        console.warn(`[senseit-chat] ${modelName} failed:`, (err as Error).message?.slice(0, 120));
        continue;
      }
    }

    if (!replyText) {
      replyText =
        "SenseIT Tactical Advisor: Immediate priority is securing Coastal Substation Alpha with defensive sandbags and routing emergency fuel reserves to City General Hospital ahead of the 3.2m surge landfall.";
    }

    return NextResponse.json({ reply: replyText });
  } catch (err) {
    console.error("[senseit-chat] Unhandled error:", err);
    return NextResponse.json(
      {
        reply:
          "SenseIT System active: Dana-3 tracking northwest toward Gopalpur. Maintain satellite telemetry surveillance.",
      },
      { status: 200 },
    );
  }
}
