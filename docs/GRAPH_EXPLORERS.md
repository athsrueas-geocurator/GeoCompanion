# Graph explorers

The user selected React Flow with a Turbo Flow inspired card style as the default, and optional force-graph as a pop-out explorer. This supersedes the earlier D3/Sigma recommendation in the library research. We use the open-source React Flow package, not a copied Pro example.

## Implemented

Two independently routed apps, People & Contributions and Research Debates, share `src/shared/graph`. Users choose an education/outreach scope or enter another space ID. Neither app owns a primary space; both retain the shared triangle icon. No new space was created.

`src/apps/graphs/graph-data.mjs` reads scoped explicit relations from Geo through the shared browser cache. Each action fetches 50 edges; Load more stops at 200. The diagram caps visible nodes at 80 and marks partial networks. HTTP/schema failures remain errors. IDs, not names, identify nodes; edge direction and relationship IDs are preserved.

Live checks on September 16 UTC against the configured Geo testnet endpoint returned 22 authorship edges (29 entities, finished cursor) in Education and a first page of 50 source/argument edges (73 entities, more pages). Query and variables are reproducible from the reader and `src/config/geo.mjs`; these are observations, not coverage guarantees. This is a bounded relation scan, not exhaustive absence proof.

React Flow lays out the selected neighborhood using Dagre. Users can select, zoom, fit, filter by relationship/name, isolate another node and inspect the equivalent relationship list. Editing is disabled. Opposition styling uses the verified property ID, never title keyword matching. A changed visible slice re-runs layout; stable incremental layout remains future work.

Preferences stores `forceGraph: false` by default. Enabling it adds an opener; only opening the dialog downloads the force renderer. It offers fullscreen, pause/resume, bounded simulation, reheat, drag-to-pin, release pins, spacing and label controls. It pauses when hidden and destroys the canvas on close. Reduced-motion users get a precomputed layout. Render failures leave the default diagram and list available.

JSON and CSV export only the visible semantic nodes/edges, scope and partial status; JSON also records filters. Simulation coordinates and preferences are excluded. CSV guards against formula injection. PNG captures the force canvas. Exports describe the selected slice, not a complete space inventory.

## Remaining work and publisher needs

September 16 label resolution: [AI/World affairs diagnosis and discovery plan](GRAPH_DISCOVERY_DIAGNOSIS.md). Valid unnamed endpoints no longer reject the entire page; exact-ID Space-to-page resolution supplies available profile labels without changing relation identity.

- People currently means explicit authorship. Public user edit history, identity-to-Person mappings, curator roles, affiliations and expertise assessments need separately verified contracts. Never infer them from names or degree.
- Research currently shows explicit sources/supporting/opposing/related edges. Community-voted current-relevance assessments need the attributable claim structure described in [the proposal](PEOPLE_AND_DEBATE_EXPLORE.md). No popularity-to-relevance inference is implemented.
- Resolve entity memberships before broad cross-space navigation; current links retain the scope in which the relation was read.
- Add focused entity-ID expansion, cross-space aggregation, stable incremental positions, back navigation, and a mobile list-first mode. Scope discovery is manual; the starter education/outreach shortcuts are not an exhaustive list of spaces.
- Publisher reconciliation should check known IDs and scoped collections before calling any missing feature a missing publication. Do not duplicate already published authors or claims.

Tests cover identity-preserving filtering, invalid scopes/cursors, export safety and preference migration. Browser verification and actual deployment evidence belong in DEPLOYMENT.md.

## Featured pins and shell correction — 0.4.1

Both graph apps now have the same full-width header outside main as the other apps, a 48px maximum/32px mobile heading, shared intro spacing, and 16px graph inputs. The old padded main wrapped the header and inherited a smaller heading rule. Pin icons have an explicit 28px flex basis so the global 52px icon basis cannot distort them.

Featured choices are queried, not enumerated. Geo's [featured-space reader](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/io/subgraph/fetch-featured-spaces.ts) uses a topic Tags relation, assigned in Root, to the Featured entity. Verified constants: Root `a19c345ab9866679b001d7d2138d88a1`, Tags `257090341ba5406f94e4d4af90042fba`, Featured `ec3086a54ddf43d8aaefd6cc6e1b0556`. This is not a boolean on Space. Live introspection confirmed Entity.spacesByTopicIdConnection and the relation connection.

`src/shared/geo/featured-spaces.mjs` pages only those Root-assigned tags, follows each topic's claiming spaces, excludes tagged articles without a claiming space and Root itself, deduplicates by ID, and sorts by name. It does not clone Geo's hardcoded space-ranking table or crawl thousands of subtopics. Consequently it is a list of all spaces attached to Root-featured topics, not a promise of identical ordering/filtering to Geo's personalized sidebar. If multiple spaces claim one featured topic they are all available here. Names and avatars are read live through existing readers; no memberships, account pins or Geo content are changed.

The September 16 UTC read returned 17 tag relations, six with claiming spaces: AI, Crypto, Health, Relationships, US Politics, World affairs. Both cursors completed. These observed names are evidence only and are not application configuration. The shared two-minute cache deduplicates requests, and failed/incomplete reads display a retry instead of a false empty list. Limits: 10 pages of 50 tags and 20 claiming spaces per topic; overflow is an explicit error. Geo edits take effect on the next uncached read.

Verification: direct cold-load People and Health pin selection rendered live authorship data; mobile document and scroll widths both 375px, heading 32px, graph input 16px. Desktop header fills the 1265px document, brand remains 24.8px and heading 48px. Tests cover tag attribution, excluding non-space content, truncation, pagination and duplicate IDs. See DEPLOYMENT.md for hosting evidence.

## Canvas-first force applet — 0.4.3

The force pop-out now fills the browser viewport immediately, with an optional native-fullscreen button. The canvas takes the remaining height under a compact toolbar; View controls and Filters & data are overlays. Opening it shows the bounded loaded network rather than just the initial two-node neighborhood. This follows the interaction direction of the official [medium graph example](https://vasturiano.github.io/force-graph/example/medium-graph/) and [force-graph API](https://github.com/vasturiano/force-graph), not its demo dataset.

Pipeline: scoped Geo relation reader -> stable semantic GraphData -> local filters/80-node cap -> toForceData mutable clones -> force-graph. The library replaces endpoint strings with objects and adds coordinates; those objects must never leak into canonical data or JSON/CSV exports. toForceData rejects duplicate/dangling nodes and retains positions for surviving IDs. The tests demonstrate mutation isolation and edge direction preservation. Pagination remains 50 edges per action/200 loaded edges; this is still a partial graph, not a mass crawl or a complete space graph.

Custom circular nodes draw a public avatar when available and initials/dots otherwise. Hover or tap highlights both incoming and outgoing neighbors while fading unrelated nodes; tap latches until a background tap. A keyboard-selectable Highlight node control offers the same inspection. Directional arrows and moving particles preserve the actual Geo edge direction. Continuous motion is enabled in this explicitly opened applet, can be switched off or paused, stops while the document is hidden, and is disabled for reduced-motion users. No synthetic entities, links or guessed topic classifications are added.

Node image enrichment runs only with the image control enabled. Automatic image preferences enable it initially; Ask first does not request image metadata or image bytes until the user checks Node images. Up to four batches of 20 exact entity IDs read explicit Avatar relations. URL values must be attributed to the same space as their avatar relation. Prefer an unambiguous avatar asserted in the viewing space; otherwise accept only a single distinct image across the returned assertions. Conflicting/truncated records remain drawn nodes. This does not substitute a cover for an avatar. Only validated IPFS CID URLs reach the fixed gateway, loaded anonymously with CORS and no referrer so PNG export remains available. Images are not included in data exports.

Live September 16 UTC probe: Health authorship's first page had 70 entities, 50 edges and four unambiguous avatar URLs. These counts can change. Future work remains: cursor-complete focused expansion, cross-space membership resolution, richer typed-node contracts, and curated entry points for impactful graphs. Library rendering capabilities do not establish availability of that data on Geo.
