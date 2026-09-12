# Education location map

Route: `#/education/map`. Leaflet 1.9.4 is a separate lazy-loaded module; no map library, Geo location request, or tile request is initiated by the root selector. The initial map JavaScript is about 47 KB gzip, plus about 7 KB gzip CSS. No VM is involved.

## Data and interpretation

`src/apps/education/location-data.mjs` queries Location relations exclusively in Education datasets (`dac259bad48a11adf97fe36857d85206`). It follows cursor pages of 100, at most ten pages. Unique destination entities are grouped by ID and linked records deduplicated by ID. Counts are records, never independent studies or programs. This is a space-level geographic discovery view, not a reconciled dataset inventory or cross-study comparison.

A second batched query reads Geo location property `7cfc4990e0684b7798aa834137d02953` exclusively in Geography space `84a679ce188f061ac9a92380bac2bab5`. At most 100 places are resolved. Missing, ambiguous, truncated or invalid coordinates stay in the list without a marker. Resolved names may come from other spaces; relation and coordinate facts retain their explicit provenance. Broad geographic points are contextual markers, not exact institutions or public service addresses. No geocoding or private encampment data is used.

September 11 live verification: 231 location-linked records, four places, complete pagination. Chicago 67; Ypsilanti 86; United States 68; Tennessee 10. Three places have coordinates; Tennessee has no unambiguous coordinate in the selected source space. Results can change after Geo indexing.

## Cache and traffic contract

The versioned public snapshot is stored under `geocompanion.education-locations.v1` in browser localStorage, independently of preferences and editorial drafts. Successful reads are fresh for one hour. Opening an older snapshot triggers one refresh; a snapshot up to seven days old remains visibly dated while refreshing or after a failure. Older or malformed storage is ignored. Refresh is manual while mounted; no polling. Thirty-second total timeout, ten-second manual attempt cooldown, bounded pagination, and visible partial coverage. A failed read does not overwrite the last successful cache. Storage failure retains in-tab results. Current compact cache is about 31 KB; actual network JSON can be larger.

Coordinates and names are cached public Geo data, not bundled content or canonical editorial text. Index changes appear after expiry or manual refresh without rebuilding.

Tiles load directly from `https://tile.openstreetmap.org`, with visible OSM attribution and ordinary HTTP browser caching. No offline downloads, tile prefetch, custom cache bypass or VM proxy. Scroll-wheel zoom is disabled; tiles update on idle with no extra buffer. The source is best-effort, not an unlimited hosting commitment; revisit the provider if traffic grows. Policy checked: https://operations.osmfoundation.org/policies/tiles/ and https://leafletjs.com/examples/quick-start/ . CSP adds only this image host; Geo remains the only external API destination.

## Verification

Build and 21 tests pass. New tests cover bad coordinates, duplicate relations, expired/corrupt cache, pagination and conflicting points. Live adapter reconciled the four places above. Desktop browser rendered tiles and markers, Chicago selection exposed its Geo record links, reload retained the original checked timestamp. Mobile 390px viewport had client/scroll widths of 375px and visible attribution; place filtering preserved the unmapped Tennessee entry. DOM image URLs confirmed the OSM tile host; live data rendered from the direct Geo adapter. Browser performance instrumentation was unavailable, so a complete network timing trace is not claimed.

Next: dataset/study grouping within location details; provenance-aware area geometry; an independently scoped outreach map after its verified dataset contract arrives.
