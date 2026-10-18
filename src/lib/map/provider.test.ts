import { describe, expect, it } from "vitest";
import { GSI_TILE_URL, getMapStyle, mapTilerEnabled } from "@/lib/map/provider";

describe("four-part map provider integration", () => {
  it("uses GSI by default without an API key", () => {
    expect(GSI_TILE_URL).toContain("cyberjapandata.gsi.go.jp");
    expect(getMapStyle("gsi")).toMatchObject({ version: 8, sources: { gsi: { type: "raster" } } });
  });

  it("uses a MapTiler-hosted style with a browser key when opted in", () => {
    expect(getMapStyle("maptiler", "abc def")).toBe(
      "https://api.maptiler.com/maps/streets-v2/style.json?key=abc%20def",
    );
    expect(mapTilerEnabled("key")).toBe(true);
  });

  it("falls back to GSI when MapTiler is unconfigured", () => {
    expect(getMapStyle("maptiler", "")).toMatchObject({ version: 8 });
    expect(mapTilerEnabled(undefined)).toBe(false);
  });
});
