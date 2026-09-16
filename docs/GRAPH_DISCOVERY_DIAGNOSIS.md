# Graph discovery diagnosis — September 16, 2026 UTC

## Result

The AI-space error was a frontend-only label requirement, not a failed Geo request, missing authorship, or force-graph limitation. No Geo proposal is needed to render the observed records. No Geo writes were made.

The first 50 authorship relations were queried in each of the six featured spaces. Every request returned HTTP 200 without GraphQL errors, with another page available. AI and World affairs each included an Authors relation targeting `e8173628fb65f0957475a58933040614`, whose Entity name was null. Crypto, Health, Relationships and US Politics had readable endpoint/type names in their first pages. These are bounded observations, not guarantees about later pages.

AI relation `16fe9c1fffdc4acd9159e3f476be8914` links claim `c08eb24cf39b4e7985b70e76dde31bd4` to that identity. World affairs relation `307852e11e6c4f848c3ef1fd9b80a782` links claim `8f903ed062154740aba339e6b0e177fc` to the same identity. Direct Entity inspection returned its self-space membership and explicit Space/EOA Space type relations. Direct Space inspection returned PERSONAL and page `3d2b574689854e65a01cc6a97834e1bc`, named Kevin.

The old parser rejected the whole page whenever an endpoint or relation type lacked a name. Refresh could not fix that deterministic assumption. The corrected reader retains valid edges, uses explicit ID labels for unnamed objects, and resolves unnamed endpoints through `spaces(filter: {id: {in: $ids}}) → page`. It does not extract a person's name from the claim title or merge the space identity with its page entity. JSON exports record labelSource and labelEntityId; Open on Geo uses the verified profile destination for those resolved nodes. Edge scope and direction stay unchanged.

Reproducible endpoint, timestamp, exact queries/variables, HTTP status, cursor state and offending records: [evidence](evidence/graph-label-diagnosis-20260916.json). Successful page bodies are summarized to counts and offending records; unrelated profile values are omitted from the direct-read evidence. The source query is preserved. Corrected live reads returned 82 nodes/50 edges for AI and 91 nodes/50 edges for World affairs; all missing names resolved. The renderer's separate 80-node bound can still make the visible slice smaller.

## Publisher patterns worth reusing

- [Class-size discovery](../../geo-publisher/scripts/education-discover-class-size-debate.ts) combines candidate searches with exact-ID incoming neighborhoods, checks advancing cursors, and distinguishes bounded search from complete traversal. Reuse identity-based neighborhood traversal; do not copy an unbounded publishing census into a phone browser.
- [Book/profile discovery](../../geo-publisher/scripts/book-curation-discover.ts) inspects both Entity and Space representations, memberships, values and relations. The frontend now applies that distinction to labels through batches of at most 20 exact IDs, only for unnamed endpoints, using its existing expiring request cache.
- [Collection membership discovery](../../geo-publisher/scripts/education-discover-early-college-memberships.ts) follows incoming Collection item relations and records completion. This provides a better future entry point for meaningful collections than scanning arbitrary space-wide edges.
- [Geo API diagnosis](../../geo-publisher/docs/geo-api-diagnosis.md) requires checking direct IDs and collection paths before proposing publication. A failed query or one bounded page is not evidence that a relationship is missing.

## Next discovery design

1. Retain a small initial space slice as an entry point. Offer curated collections and entity search to select a useful starting node. Do not infer semantic roles from text or degree.
2. Expand that node on demand with separate incoming and outgoing scoped relation queries. Keep a cursor per direction/scope/type and an explicit request/node budget. Preserve already loaded nodes on a later-page failure and never report that failure as zero neighbors.
3. Hydrate only new IDs, resolve names and verified memberships separately, and deduplicate by stable IDs. Cache by scope/query/variables; manual refresh re-reads living data. Keep assertion scope on every edge even when labels come from another space.
4. Let users explicitly include another asserting space; do not silently combine conflicting claims. Preserve parallel relationships and provenance. A Person, a personal Space and its profile page remain separate unless Geo supplies a verified mapping.
5. Feed the same semantic slice to React Flow and force-graph. Rendering clones may gain coordinates and object endpoints; canonical IDs, labels, provenance and export semantics must not mutate.

## AI-space proposal decision

Current classification: **frontend-only**, with an existing-readable profile label. Do not create a duplicate Kevin entity, rename another user's profile, or rewrite the observed Authors edges to make a visualization work.

A useful future proposal could add an editor-selected graph entry collection with explicit membership, named topics/claims, source links and existing supporting/opposing relationships. Before preparing operations, discover the current AI-space collections and schema, finish the relevant scoped cursors, reconcile exact IDs and known incoming memberships, and identify a specific existing-needs-link or absent-after-discovery gap. Submit only reviewed additive changes with the space's governance process. This document is a plan, not a submitted proposal or authorization to publish.
