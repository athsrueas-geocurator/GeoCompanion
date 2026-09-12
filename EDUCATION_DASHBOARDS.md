# Education dashboards

## Current implementation — September 12, 2026

The local application discovers datasets through the ordered native catalog in Education datasets. Dataset membership, names, descriptions, result blocks, interpretation text, typed values and relationship labels come from Geo. No education dataset JSON or fixed result/member list is shipped. The browser reads Geo directly; Cloudflare delivers the interface.

`src/apps/education/DatasetExplorer.tsx` renders the catalog and selected collection. `dataset-data.mjs` validates scoped records and resolves the dataset's ordered Blocks and Collection item edges. `src/shared/geo/collections.mjs` provides cursor traversal. Catalog and block discovery still have a 1,000-edge completion bound; selected result collections load at most four new 25-edge pages per action and expose Load more. Complete coverage must not be inferred from a partial read.

The collection filter is derived by `result-facets.mjs` from actual named relationships, grouped by relation type. Options are identified by both relation type and target ID, so the same entity appearing in different roles stays distinct. Counts represent unique loaded records, not independent studies. Renames retain identity; removed options cease filtering. Structural type/block/member links are excluded. Filters add no network requests and do not establish scientific comparability.

## Numeric interpretation

`CollectionPlot.tsx` and `plot-contract.mjs` retain a deliberately constrained plot capability: numeric effect and nonnegative standard error, percentile-point unit, grade/arm dimensions, and a common known study, comparator and estimand. Names of dimensions come from Geo. Approximate intervals are calculated as effect ± 1.96 × standard error; this calculation is explained in an optional disclosure. A partially loaded collection cannot produce a plot.

Other results remain readable with their published fields, descriptions and source links. Equal units alone do not establish comparability. Broader outcome/instrument and study-family contracts remain unfinished; no cross-program affordability ranking, summed overlapping cohort size, or conversion of modeled costs into observed costs is implemented.

## Refresh and references

The shared reader bounds concurrent requests, deduplicates in-flight reads and caches successful responses for two minutes. Explicit refresh invalidates the cache; stale visible-tab returns revalidate without interval polling. New complete membership replaces old membership. Generation guards discard late results after selection changes. Missing or conflicting required fields cannot silently become numeric zeros.

Dataset references use the membership-aware GeoReference component: a known destination is a link; ambiguous destinations offer on-demand space choices. A changed target or membership resets pending reference UI, preventing an older lookup from adding stale destinations.

Canonical personal writing belongs on the user's Geo profile and is handled separately by Curation. No assistant-authored book framing or static editorial fallback is part of the dashboard. See EDITORIAL.md.

## Verification and remaining work

Local verification September 12: build and 59 tests pass. STAR displayed eight records. Head Start appeared as the 27th catalog entry without a member-list code change, with six selectable collections. Its first collection exposed Topics, Sources, Related entities and supporting/opposing argument filters; filtering four records to one succeeded. A 390px browser check found no page overflow. Earlier intercepted read-response checks verified membership removal and unit edits without writing to Geo; delayed-reference testing verified old destinations cannot reappear after selection changes.

These are local implementation checks, not a deployment claim. DEPLOYMENT.md records the actual production release. Remaining work is tracked in TODO.md and docs/LIVING_GEO_DESIGN.md: per-action bounds for other collection entry points, robust block capability classification, broader comparison contracts and remaining cache/refresh migrations. Publisher data gaps belong in its canonical publishing_queue.md; existing readable data should not be duplicated to accommodate a frontend limitation.
