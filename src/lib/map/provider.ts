export type MapProvider = "gsi" | "maptiler";

// Base tiles are not geocoding / Places APIs. Attribution is mandatory.
export const GSI_TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png";
export const MAPLIBRE_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js";
export const MAPLIBRE_STYLE_URL = "https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css";
export const GSI_ATTRIBUTION = '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル（国土地理院）</a>';

// The MapTiler browser key MUST be domain-restricted in the MapTiler dashboard.
export function getMapStyle(provider: MapProvider, mapTilerKey?: string) {
  if (provider === "maptiler" && mapTilerKey?.trim()) {
    return "https://api.maptiler.com/maps/streets-v2/style.json?key=" +
      encodeURIComponent(mapTilerKey.trim());
  }
  return {
    version: 8 as const,
    sources: {
      gsi: {
        type: "raster" as const,
        tiles: [GSI_TILE_URL],
        tileSize: 256,
        maxzoom: 18,
        attribution: GSI_ATTRIBUTION,
      },
    },
    layers: [{ id: "gsi-standard", type: "raster" as const, source: "gsi" }],
  };
}

export function mapTilerEnabled(value?: string) {
  return Boolean(value?.trim());
}
