import "server-only";

import { connection } from "next/server";
import { isFirebaseConfigured } from "@/lib/env";
import { executePublicQuery } from "@/lib/firebase/data-connect";
import { toPublicMapPin, type MapLocationRow, type PublicMapPin } from "@/lib/map/pins";
import { isPublicMapDataEnabled, type PublicMapRolloutStatus } from "@/lib/map/rollout";

export type PublicMapState = { status: PublicMapRolloutStatus; pins: PublicMapPin[] };

export async function getPublicMapState(): Promise<PublicMapState> {
  // The feature is OFF until the schema/connector has been deployed and tested.
  // GitHub Pages and unconfigured environments always return zero real pins.
  if (!isPublicMapDataEnabled() || !isFirebaseConfigured()) {
    return { status: "disabled", pins: [] };
  }
  await connection();
  try {
    const response = await executePublicQuery<{ challenges: MapLocationRow[] }>(
      "ListPublishedMapPins",
    );
    return {
      status: "ready",
      pins: response.data.challenges
        .map((row) => toPublicMapPin(row))
        .filter((pin): pin is PublicMapPin => pin !== null),
    };
  } catch {
    // Never expose SQL Connect internals or private data in a public error message.
    console.error("Public map location query unavailable");
    return { status: "unavailable", pins: [] };
  }
}
