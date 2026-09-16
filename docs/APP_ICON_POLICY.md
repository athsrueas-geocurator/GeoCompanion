# App icons and source dominance

Every new app must register in `src/app/apps.mjs` with a valid `defaultSpace` representing its initial data scope. The graph apps now open Education by default; a validated `?space=` hash parameter can select another scope. Optional `&focus=` selects a node already present in the loaded slice, not an unbounded discovery request.

After a successful data load, pass `{space, id}` contributions to `rememberAppSpace`. `dominantSpace` counts unique entity IDs within each asserting space, sorts by descending count, then by ascending space ID for deterministic ties. Duplicate edges and repeated pages do not inflate the count. It measures the loaded app dataset, not all of Geo, edit activity, reputation or query frequency. Do not use every global membership as attribution.

Graph apps report endpoint IDs under their edges' asserting spaces after each successful assembled page. Education reports its scoped catalog; outreach reports its directory and hydrated linked records. These are the apps' current primary dataset contracts, not a census of every education subview. Future multi-space adapters must submit their combined current dataset, replacing the previous contribution snapshot rather than accumulating browsing history. Empty data uses the app's declared starting scope.

Only the winning space ID and timestamp are cached in sessionStorage for up to 24 hours; no entity list or user identity list is persisted. Home reads that choice on return. Blocked storage uses the declared starting scope. Selecting a different graph scope updates the winner after its data loads. No extra graph scans are performed just to choose an icon.

Home always passes the resulting space to SpaceIcon, which reads its live scoped Avatar and immutable IPFS URL. The existing five-minute icon cache applies. Missing/conflicting/unavailable icons use the shared triangle; do not invent an avatar or take another space's icon merely to fill a hole. Space editors can publish an Avatar using the normal reviewed publisher workflow. A network error alone is not evidence of a missing avatar.

New-app checklist: register a data scope; emit deduplicable scoped contributions; use the shared icon path; preserve bounded reads; test tie/empty behavior; document what dataset is counted. The registry test prevents adding an app without a starting space.

## Publisher review queue — September 16 UTC

Health (`52c7ae149838b6d47ce0f3b2a5974546`): a direct read using `iconQuery` in `src/shared/branding/space-icons.mjs` returned HTTP 200, no GraphQL errors, and zero page Avatar relations asserted in that space, with `hasNextPage:false`. This is absence in that exact scope, not an all-space image absence claim. Review the existing page's other scoped relationships before proposing a new Avatar; reuse an existing approved image if appropriate. The app keeps the triangle until a readable scoped Avatar is available. No image publication is authorized by this queue alone.
