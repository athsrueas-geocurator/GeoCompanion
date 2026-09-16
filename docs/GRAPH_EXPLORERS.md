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

- People currently means explicit authorship. Public user edit history, identity-to-Person mappings, curator roles, affiliations and expertise assessments need separately verified contracts. Never infer them from names or degree.
- Research currently shows explicit sources/supporting/opposing/related edges. Community-voted current-relevance assessments need the attributable claim structure described in [the proposal](PEOPLE_AND_DEBATE_EXPLORE.md). No popularity-to-relevance inference is implemented.
- Resolve entity memberships before broad cross-space navigation; current links retain the scope in which the relation was read.
- Add focused entity-ID expansion, cross-space aggregation, stable incremental positions, back navigation, and a mobile list-first mode. Scope discovery is manual; the starter education/outreach shortcuts are not an exhaustive list of spaces.
- Publisher reconciliation should check known IDs and scoped collections before calling any missing feature a missing publication. Do not duplicate already published authors or claims.

Tests cover identity-preserving filtering, invalid scopes/cursors, export safety and preference migration. Browser verification and actual deployment evidence belong in DEPLOYMENT.md.
