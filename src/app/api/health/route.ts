import { NextResponse } from "next/server";
import { isFirebaseConfigured } from "@/lib/env";
import { executePublicQuery } from "@/lib/firebase/data-connect";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  if (!isFirebaseConfigured()) {
    return NextResponse.json(
      { status: "degraded", dataConnect: "not_configured" },
      { status: 503, headers: noStoreHeaders },
    );
  }

  try {
    await executePublicQuery<{ challenges: Array<{ id: string }> }>("HealthCheck");
    return NextResponse.json(
      { status: "ok", dataConnect: "reachable" },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    console.error(
      "Data Connect health check failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { status: "degraded", dataConnect: "unavailable" },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
