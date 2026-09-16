# Larger graph exploration and opt-in cache

## Implemented contract (0.5.1)

The home page and Preferences offer **Cache data from Geo**. It is off by default. Enabling storage starts a bounded update pass. Enabled visits automatically start another pass; returning to a visible tab after 30 minutes also checks again. A running pass is never duplicated. The coordinator is mounted above app routes, so Continue in background preserves the running job during navigation. It requires the browser tab to remain open; it is not a server or service-worker job.

The progress denominator grows as discovery adds tasks. Progress measures completed tasks, not bytes or an invented percentage of all Geo. Distinct discovered entity IDs are counted separately (currently graph/catalog/result tasks). The expandable activity log includes public GraphQL query text, cache hits, task completion, and errors. Errors do not become successful empty results. Stop takes effect after the current adapter task; a task may contain several requests. Re-running reconstructs the queue and reuses fresh cache entries.

### Reader and storage

`src/shared/geo/client.mjs` continues to validate responses through feature parsers, share identical requests, and schedule at most four concurrent requests. With opt-in enabled, validated results are stored in IndexedDB by endpoint, parser version, exact query, and variables. Saved records have no age-based deletion. Ordinary reads reuse records checked within 30 minutes; visit/manual update passes bypass stale snapshots and replace successfully validated query results. Failed refreshes leave saved records intact. Memory-only caching remains the default. Detail/profile/image reader versions are excluded from persistence. Images, tiles, credentials and wallets are not downloaded by the warmer.

`local-cache.mjs` serializes writes and enforces a 16 MiB estimated serialized-data budget without evicting saved entries. If a write would exceed the budget, it reports a storage warning and retains existing records. This is a storage limit, not a network-byte quota or browser disk-size guarantee. Storage failures fall back to ordinary reads and are reported to the active job. Refresh invalidates memory and bypasses previously saved results without deleting them; generations prevent superseded requests from overwriting fresh data. Disabling storage stops automatic jobs at their task boundary and pauses cache reads/writes, retaining saved entries. Only Clear saved cache explicitly deletes them. Browser eviction remains possible. This is not a complete offline app snapshot.

### App warmers

`src/shared/cache/warm.mjs` registers bounded work using the existing frontend readers:

- Education: ordered dataset catalog, discovered dataset blocks, first result window for collection blocks, and questions.
- Outreach: existing contact-free directory adapter, including linked providers, public locations and source links.
- People and Research Debates: default app spaces plus dynamically discovered featured spaces; authorship, argument/source, and unrestricted relationship modes, up to four 50-edge pages per mode/space.

The whole pass allows at most 300 unique tasks, logs any skipped work at the budget, and never claims an exhaustive space mirror. Older education readers (atlas, curation, map and argument-specific readers) are not yet fully migrated to this persistent cache; they continue their existing on-demand reads. Image and map downloads obey their existing controls. New apps must add a bounded warmer here as well as a registry entry; do not execute hidden UI navigation to prime a cache.

### Graph assembly

`graph-data.mjs` adds all-published-relationships discovery and scoped incoming/outgoing neighborhood reads, validated against live RelationFilter introspection on September 16, 2026. Arbitrary property IDs retain their real labels/direction, rather than being reclassified as support, opposition, authorship, or expertise. Nodes are relation endpoints, not fabricated connections. Explicit space scope remains mandatory.

`readGraphWindow` assembles already-cached continuation pages without initiating an automatic additional crawl. Load more adds 50 relationships; Expand focus adds up to 50 incoming and 50 outgoing relationships, retaining per-node direction cursors. Repeated expansion can follow another hop after selecting a newly discovered node. Every merge deduplicates by canonical IDs and checks scope. A session stops offering further root pages at 2,000 loaded relationships; expansion can finish its two-page batch near that boundary. Partial labels remain until coverage is known.

The force explorer offers 80, 250, 500 or 1,000 visible nodes (500 default), independent of the structured diagram's 80-node rendering limit. The selector retains connected neighborhoods using degree-ordered seeds and breadth-first traversal, rather than arbitrarily dropping nodes by API order. Filters and exports operate on the actual selected slice. Load more and Expand focus are available within Filters & data while the applet is open. Clicking a force node updates the expansion focus.

## Verification and next steps

Automated tests exercise growing queues, failure continuation, stop boundaries, graph size choices, connected truncation, deduplication and scope rejection, alongside existing transport/cache tests. Browser checks cover the opt-in controls, queue progress, navigation, persistent reuse, graph expansion and force controls. See DEPLOYMENT.md for release evidence.

Remaining work: optional layer presets that hide schema/layout relations, explicit multi-space traversal, a durable job resume after closing the tab, byte-budgeted network downloads, and migrating older per-feature caches. A larger graph still describes the loaded slice, not all of Geo; never fill absent edges by guessing from similar names.

### Retention is not freshness

Browser storage may still be cleared by the browser or user. Stored query results are replaced on successful revalidation, so removed memberships disappear from refreshed views. Unused old query keys remain until explicit clearing; storage-full warnings make this visible rather than silently deleting records. Old retained records are not treated as fresh live data after their freshness window.
