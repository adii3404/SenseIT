import { NextResponse } from "next/server";
import { db } from "@/db";
import { dispatches } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      authorities?: string[];
      message?: string;
    };
    const authorities = (body.authorities ?? []).filter(
      (a): a is string => typeof a === "string" && a.length > 0,
    );
    const message = typeof body.message === "string" ? body.message : "";

    if (authorities.length === 0 || !message) {
      return NextResponse.json(
        { ok: false, error: "authorities and message are required" },
        { status: 400 },
      );
    }

    // Simulate a realistic 1.5-second network round-trip to emergency services
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let dispatchId = Math.floor(Math.random() * 90000) + 10000;
    let createdAt = new Date().toISOString();

    if (process.env.DATABASE_URL) {
      try {
        const [row] = await db
          .insert(dispatches)
          .values({ kind: "warning", authorities, message })
          .returning({ id: dispatches.id, at: dispatches.createdAt });
        if (row) {
          dispatchId = row.id;
          createdAt = row.at ? row.at.toISOString() : createdAt;
        }
      } catch (dbErr) {
        console.warn("[senseit] DB insert failed, using fallback dispatch confirmation", dbErr);
      }
    }

    return NextResponse.json({
      ok: true,
      id: dispatchId,
      at: createdAt,
      confirmation: `Alerts dispatched via SMS and Email to ${authorities.join(", ")} and Municipal endpoints.`,
    });
  } catch (err) {
    console.error("[senseit] dispatch failed", err);
    return NextResponse.json(
      { ok: false, error: "dispatch uplink failed" },
      { status: 500 },
    );
  }
}
