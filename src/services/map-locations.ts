import "server-only";

import { connection } from "next/server";
import { isFirebaseConfigured } from "@/lib/env";
import { executePublicQuery } from "@/lib/firebase/data-connect";
import { toPublicMapPin, type MapLocationRow, type PublicMapPin } from "@/lib/map/pins";

export async function getPublicMapPins(): Promise<PublicMapPin[]> {
  // Static GitHub Pages preview has no consented locations, never fake pins.
  if (!isFirebaseConfigured()) return [];
  await connection();
  const response = await executePublicQuery<{ challenges: MapLocationRow[] }>(
    "ListPublishedMapPins",
  );
  return response.data.challenges
    .map((row) => toPublicMapPin(row))
    .filter((pin): pin is PublicMapPin => pin !== null);
}
