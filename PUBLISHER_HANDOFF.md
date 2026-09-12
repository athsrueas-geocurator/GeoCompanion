# Education Initiatives: Geo publisher handoff

## User intent

Geo Companion's first app will let users explore the information in [Education-Initiatives](https://github.com/athsrueas-geocurator/Education-Initiatives), with the displayed data fetched live from Geo rather than bundled from GitHub JSON or spreadsheets. On 2026-09-11 the user confirmed this dataset still needs publishing and requested coordination with the agent responsible for geo-publisher.

Delivery status: placed in the user-identified publisher workspace on 2026-09-11 at [geo-publisher/docs/education-initiatives-handoff.md](https://github.com/athsrueas-geocurator/geo_publisher/blob/main/docs/education-initiatives-handoff.md), with pointers in its agents.md and todo.md. That copy is the publishing-side working handoff. The publisher task has since received coordination messages. The initial inventory below is historical migration context, not a current completeness claim; see ARCHITECTURE.md for implemented readers.

## Responsibilities

The publisher agent owns ontology discovery, mapping, migration preparation, publishing under its established user authorization, and reconciliation. The frontend task owns the browser UI, read adapter, Cloudflare hosting, and display of missing/loading/error states. Coordinate the data contract before either side hardcodes property or relation IDs.

This handoff requests a concrete mapping and publishing plan. It does not authorize speculative ontology creation, deletion of existing graph data, or immediate wallet transactions. Report the proposed target, operations, and unresolved choices before publishing unless the user's existing authorization in the publisher task already covers them. Never pass wallet keys through task messages or reports.

## Source inventory

Inspected `main` on 2026-09-11; record the exact commit before migration because the branch can change. The app is currently a static Next.js site whose `src/lib/content-loaders.ts` imports generated JSON.

| Source | Observed rows | Consumer need |
| --- | --- | --- |
| `content/initiatives.json` | 76 | Searchable initiatives and detail views |
| `content/sources.json` | 106 | Citations, findings, methods, caveats, source links |
| `content/dichotomies.json` | 21 | Evidence comparisons and uncertainty |
| `content/methods.json` | 51 | Method definitions and supporting URLs |
| `content/glossary.json` | 59 | Searchable definitions |
| `content/landing-cards.json` | Not counted | Editorial entry points linked to evidence |

Use `src/lib/content-schema.ts` as the source field contract and `scripts/generate-geobrowser-csvs.mjs` as an existing export reference to inspect. Do not assume its output matches the current ontology. The dashboard also references `research-data/dataset-catalog.json`; determine whether this dependency and any research assets belong in the first release.

## Information that must survive the mapping

- Initiatives: source ID/slug, name, years, category, theory of action, changed inputs, target population, evaluation designs/method tags, evidence strength, measured outcomes, normalization issues, finding, tags, and links to sources/comparisons.
- Sources: source ID, title, authors, year, method, outcome tags, evidence strength, finding, caveat, and original URL.
- Comparisons: title/slug, topic, framing, philosophical disagreement, left/right poles, position, uncertainty bounds, confidence, explanation, evidence strength, suggested interpretation, better question, common misreadings, revision criteria, related initiatives/sources, and editorial priority.
- Methods and glossary: definitions, groupings, and citations where available.
- Landing cards: claim, caveat, evidence strength, and links to comparisons/sources.

Keep editorial evidence ratings and continuum positions identifiable as curated assessments, with provenance. Preserve limitations alongside findings. Do not turn a descriptive source into a causal claim during migration. Do not invent numeric values for missing information.

Use existing Geo entities/types/properties where semantically appropriate. Preserve source keys in a crosswalk; do not equate a source slug or numeric ID with a Geo UUID. Shared sources should remain shared rather than duplicated for each initiative.

## Geo context to verify

- SDK: https://github.com/geobrowser/geo-sdk/blob/main/README.md
- GraphQL: https://api-testnet.geobrowser.io/graphql
- REST/OpenAPI: https://api-testnet.geobrowser.io/openapi
- Previously supplied candidate space: `784bfddae3f3976118c561bf28195b44`
- Previously supplied entity/page: `52b22516154345deac2a3d08b10e7cb2`

Both IDs exist on testnet, but this does not prove the space is the intended migration destination or that the signing wallet can publish there. Verify governance, permission, and target purpose. The sibling geo-publisher code defaults to the differently named `testnet-api.geobrowser.io` host; resolve endpoint/version compatibility explicitly.

## Return to the frontend task

1. Source commit and per-collection counts, including unresolved or excluded records.
2. Confirmed network, target space, permissions, and governance workflow.
3. Mapping from each source field to existing Geo type/property/relation IDs, including approved extensions and missing fields.
4. Stable source-to-Geo ID crosswalk, duplicate detection, and an idempotent rerun strategy.
5. Tested read-only GraphQL queries and sample responses for listing/filtering initiatives, one initiative with sources, and related comparisons. Scope facts to the intended space; do not silently merge conflicting values across spaces.
6. Publishing batch plan and dry-run report; after authorized execution, edit/transaction references, IPFS CIDs, indexing status, and reconciliation results.
7. For actual IPFS assets: MIME type, usable gateway, and persistence responsibility. Do not invent a direct-file URL for structured graph facts.

## Acceptance

The first end-to-end slice is one fully mapped initiative with its sources and available comparison links, queried directly from Geo and rendered in the frontend. The full migration must reconcile all intended source records and relationships. A changed Geo finding should appear after refresh/refetch without rebuilding the frontend, once indexed. Never silently fall back to bundled GitHub content while presenting it as live Geo data.
