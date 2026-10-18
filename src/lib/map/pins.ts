export type PublicMapPin = {
  challengeId: string;
  title: string;
  label: string;
  latitude: number;
  longitude: number;
  precision: "exact" | "area";
};

export type MapLocationRow = {
  id: string;
  title: string;
  area: string;
  status: string;
  isSample: boolean;
  deadline: string | null;
  mapApproved: boolean;
  mapLatitude: number | null;
  mapLongitude: number | null;
  mapLabel: string | null;
  mapPrecision: string | null;
};

// Extra server-side checks protect against malformed/misconfigured connector data.
// Never derive public coordinates from private WISH.address.
export function toPublicMapPin(row: MapLocationRow, now: Date = new Date()): PublicMapPin | null {
  if (!row.mapApproved || row.status !== "published" || row.isSample) return null;
  if (!row.id || !row.title?.trim() || !row.mapLabel?.trim()) return null;
  if (row.mapPrecision !== "area" && row.mapPrecision !== "exact") return null;
  if (row.deadline !== null) {
    const deadlineTime = Date.parse(row.deadline);
    if (!Number.isFinite(deadlineTime) || now.getTime() > deadlineTime) return null;
  }
  const { mapLatitude: latitude, mapLongitude: longitude } = row;
  if (latitude === null || longitude === null) return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return {
    challengeId: row.id,
    title: row.title.trim(),
    label: row.mapLabel.trim(),
    latitude,
    longitude,
    precision: row.mapPrecision,
  };
}
