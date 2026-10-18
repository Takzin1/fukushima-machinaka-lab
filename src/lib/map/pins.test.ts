import { describe, expect, it } from "vitest";
import { toPublicMapPin, type MapLocationRow } from "@/lib/map/pins";

const row: MapLocationRow = {
  id: "challenge-1", title: "まちなか実証", area: "福島市",
  status: "published", isSample: false, deadline: "2026-12-31T14:59:59Z",
  mapApproved: true, mapLatitude: 37.75, mapLongitude: 140.46,
  mapLabel: "公開承認済み活動エリア", mapPrecision: "area",
};
const now = new Date("2026-10-19T00:00:00Z");

describe("public-map privacy boundary", () => {
  it("only returns the curated map location fields", () => {
    expect(toPublicMapPin(row, now)).toEqual({
      challengeId: "challenge-1", title: "まちなか実証",
      latitude: 37.75, longitude: 140.46, label: "公開承認済み活動エリア", precision: "area",
    });
  });

  it("rejects pending, sample, unpublished and expired records", () => {
    expect(toPublicMapPin({ ...row, mapApproved: false }, now)).toBeNull();
    expect(toPublicMapPin({ ...row, isSample: true }, now)).toBeNull();
    expect(toPublicMapPin({ ...row, status: "draft" }, now)).toBeNull();
    expect(toPublicMapPin({ ...row, deadline: "2026-01-01T00:00:00Z" }, now)).toBeNull();
  });

  it("rejects missing coordinates, invalid precision and malformed location labels", () => {
    expect(toPublicMapPin({ ...row, mapLatitude: null }, now)).toBeNull();
    expect(toPublicMapPin({ ...row, mapLongitude: 500 }, now)).toBeNull();
    expect(toPublicMapPin({ ...row, mapPrecision: "unknown" }, now)).toBeNull();
    expect(toPublicMapPin({ ...row, mapLabel: "" }, now)).toBeNull();
  });
});
