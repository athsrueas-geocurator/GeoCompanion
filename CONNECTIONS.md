# Connections

September 12 local update (not yet deployed): discovery now also includes Supporting, Opposing and Related claims edges. Target memberships are preserved separately from asserting spaces; shared reference navigation no longer chooses the first space automatically. Broader active-dataset scope and shared cache migration remain pending.

Replaces the generic entity gallery at the existing `#/education/live` route. The old “Original linked space” was Documentation (`784bfddae3f3976118c561bf28195b44`), retained from the user's initial example; it was not an application dataset and has been removed.

The view groups incoming Sources, Location and Related entities edges by target ID: shared papers, studies, places and related reading. Counts represent distinct connected records, not independent studies, corroboration, importance or causal agreement. Individual edges preserve source-space provenance and their actual relation labels. Unnamed implementation records are omitted.

## Dynamic discovery

The root IDs are imported from the existing education and curation adapters; they are bootstrap scopes, not a separately curated menu. The dropdown is built from these roots plus returned target space memberships, with names resolved in a batched Geo spaces query. New linked targets/spaces enter after refresh without changing the menu code. A space appearing here indicates connected entity membership, not that all its content is relevant, endorsed, or imported into this app. Shared geographic entities can connect otherwise unrelated spaces. The view never merges numeric assertions across those spaces.

This initial slice covers education dataset relationships and profile curation, including their place/book references. It does not crawl every relation in Geo, the keyword-discovered debate graph, or the unpublished outreach dataset. New independently sourced app modules must expose their bootstrap scope; future supported relationships under existing roots are automatic.

## Bounds and cache

First page: 100 relations per root, requested concurrently, plus a batched space-name lookup. Load more uses each unfinished root's cursor. Stops offering additional pages after at least 2,000 loaded edges (a final page can exceed that threshold). Space labels capped at 100. Always expose More available while pages remain; sorting and filters apply to loaded connections, not full graph totals. Twenty-five-second timeout, 10-second forced-refresh cooldown, five-minute memory reuse, 40 cached queries maximum, no polling, no VM or static data fallback. The UI is lazy loaded (~3 KB gzip plus small shared adapters).

## Verification

Initial live read: 101 edges, 21 grouped targets, 10 connected spaces, further pages available. Books filter exposes the Zen work and its Related entities link back to Educator turned builder. Other groups include Reading First, Perry, Saga and school-finance sources/studies. Build and 26 tests passed, including duplicate edge/source handling, preserved space provenance, new space discovery and malformed links. Browser verified dynamic options and expandable book-to-post connection. This is a relationship exploration slice, not completion of the multi-study comparison bounty.
