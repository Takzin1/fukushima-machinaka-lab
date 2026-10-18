# ADR-0001 — Four-way public map integration

Status: proposed; production deployment requires tile-policy and infrastructure verification.

## Architecture

```text
/map (Next.js / MapLibre GL JS)
  +-- basemap provider: GSI standard raster (default)
  |                    MapTiler streets-v2 (optional browser key)
  +-- getPublicMapPins() [server]
       +-- Firebase Data Connect: ListPublishedMapPins [PUBLIC]
            +-- Cloud SQL Challenge: mapLatitude / mapLongitude /
                mapLabel / mapPrecision / mapApproved
                 +-- Admin-approved reviewed public location
```

## Security boundary

- Do not derive, forward, display or geocode private `wish.address` in public maps.
- Map position is separately entered by an authenticated admin after publication permission is verified.
- Public connector query filters `status=published`, `isSample=false`, `mapApproved=true`.
- Server validation also excludes expired, invalid, sample and unapproved locations.
- Updating public location runs via an admin-only Server Action and an admin-verified Data Connect mutation.
- `area` denotes an approved approximate location, not a guess at a person's home or storefront.
- Revoking map approval makes the pin disappear from future public map reads.

## External providers

- GSI standard tiles `https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png`.
- MapLibre GL JS (pinned CDN `4.7.1`) renders the map; the script and CSS are external in this first PR.
- Firebase Data Connect / Cloud SQL stores reviewed pin data, not geocoding output.
- MapTiler `streets-v2/style.json` is an *alternative* basemap, not an overlay. Optional public browser key `NEXT_PUBLIC_MAPTILER_KEY` must be domain-restricted.

## Release gates

1. Verify GSI tile license and attribution requirements, usage limits and production suitability.
2. Verify MapTiler browser-key restrictions, request budget, usage conditions and current pricing.
3. Harden the MapLibre CDN loading strategy (prefer lockfile-managed dependency and CSP/SRI).
4. Run `npm run sql:compile` and review schema migration before `npm run sql:deploy`.
5. Check authenticated admin mutation cannot be called by students or shop owners.
6. Test published but unapproved, sample, expired, malformed and revoked pins.
7. Test `lint`, `typecheck`, `test`, `build`, `build:pages`, mobile map UX and error fallback.
8. Secure written business consent before publishing any exact point.

No real-world pin is seeded.
