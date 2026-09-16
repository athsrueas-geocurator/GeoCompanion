# Live Indianapolis outreach pilot

September 15 update: the directory now reads four published services, including separate We Bloom weekday and Saturday access. Version 0.3.5 adds typed Schedule reads and a weekly published-hours view. The historical one-service snapshot below is superseded by the [live data audit and remaining queue](DATA_AUDIT_2026-09-15.md). Schedule information supplements the original property allowlist; copied contact information remains excluded. Food-specific filtering and “open now” remain unavailable pending the necessary data.

Verified September 14, 2026 against the public Geo API and a local browser. The first publication is Outreach, Inc.'s Near Eastside program-center access for youth ages 14–24. This is one service, not a comprehensive directory.

## Read path

`Directory.tsx` calls `outreach-data.mjs`: Public good space → directory Dataset → Blocks → Collection item relations → service records → provider, location and source relations. `OutreachMap.tsx` receives the same filtered services and deduplicates public stops by entity ID. New collection members and removed members are reflected on refresh without changing code. The dataset root and property IDs are integration configuration; service content is not bundled.

- Space: `f24e3bbd26304474b7e0c2a0877f4bfe`
- Dataset: `0ae9cde5b3f347208e35b746a6b57799`
- First service: `e184043c5d2b4decbc6accb33a99b522`
- Public stop: `39bf6930e2f0427d9b70c5174850835d`
- Service type: `0e0ff96eb1b84385901f46151c09659f`
- Public-stop type: `c86e21e4a16e49ccbc0606b25435efe1`
- Point property: `52ea43b6fe4c4512a763e47986a26ef0`
- Provider / location / source relation IDs are in the adapter's `P` registry.

The shared reader has a two-minute bounded memory cache, deduplicates concurrent reads, and limits request concurrency. Refresh invalidates that memory cache. There is no local JSON fallback or disk copy of operational records. Geo API reads and map tiles go directly from the browser to their providers; Linux is not involved.

Only name, description, public URL and Point properties are requested. Dedicated contact fields and people/contact relations are excluded. Prose is screened for common email/phone patterns before caching; this is defense in depth, not a substitute for publisher review. Public HTTPS source links replace copied contacts. Locations must carry the explicit public-stop type before they can produce a pin. No private encampments or route inference. Popups use textContent, never upstream HTML.

Complete paginated membership is required. Truncated, conflicting, wrong-space or wrongly typed service responses fail visibly. Missing linked details are omitted; absent coordinates never become guessed map pins. The reader currently follows explicit collection items, not dynamic filter-based block sources; a publisher changing that representation needs a corresponding adapter capability. Search is local over the loaded snapshot. Coordination currently reuses service cards; it is not a full coordination matrix.

## Publisher follow-up

The publisher's earlier `docs/indianapolis-outreach-query-contract.md` still describes the pre-publication state. Reconcile it with these newer artifacts in [geo-publisher](https://github.com/athsrueas-geocurator/geo_publisher):

- `data/indianapolis-outreach-directory/s019-pilot-registry.json`
- `data/indianapolis-outreach-directory/s019-pilot-publication.json`
- `data/indianapolis-outreach-directory/pilot-schema-registry.json`
- `scripts/2026-09-14-publish-outreach-s019-pilot.ts`

Keep adding reviewed service rows through the directory collection, with scoped provider, source and public-stop relations. The next prerequisites are:

1. Typed service categories, especially food/meal distinctions, and structured eligibility.
2. Schedule verification dates, source freshness, timezone, exceptions and expiration policy. The pilot has an RRULE schedule, but that alone does not establish present availability; the app intentionally does not interpret it as “open now.”
3. Public-location review and coordinate provenance for every additional pin. The first coordinate is a public map-provider pin, not a surveyed entrance.
4. Only public contact-source URLs; no names of contact people, copied phone/email values or private locations.
5. Updated indexed contract with actual published IDs and successful API read evidence, separate from transaction submission receipts.

Until these exist, weekly and food views link back to provider information rather than inventing availability. The full research intake remains in the publisher repository; do not copy its raw contact data into this app.

## Validation

Adapter tests cover public-stop gating, invalid coordinates, incomplete/conflicting/wrong-space data, non-web/contact URLs and removal from collection membership. A live browser rendered one service, its official source link and the Near Eastside map pin. This document records integration evidence; DEPLOYMENT.md records release status.
