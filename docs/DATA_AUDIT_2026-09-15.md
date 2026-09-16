# Live data audit — September 15, 2026

Reads used `https://api-testnet.geobrowser.io/graphql` (September 16 UTC). No Geo writes occurred. This is a scoped audit of the education catalog and Indianapolis directory, not an exhaustive census of every entity in both spaces.

## Education

The complete catalog contains 27 datasets. A separate Dataset-type census in education space `dac259bad48a11adf97fe36857d85206` completed two pages and found the same 27 IDs:

```graphql
query D($space: UUID!, $after: Cursor) {
  entitiesConnection(first: 25, after: $after, spaceId: $space,
    typeId: "0c4babfb43893486af827341bbf32e09") {
    nodes { id name }
    pageInfo { hasNextPage endCursor }
  }
}
```

Variables: the education space above; `after: null` initially, then the returned end cursor until `hasNextPage: false`. Catalog root: `2279edef1bbe479c872caeb72ee90022`.

Using `datasetCatalog()`, `datasetBlocks(dataset.id)` and `resultRows(block.id)` from `src/apps/education/dataset-data.mjs`, complete traversal read 90 blocks and 471 collection entries, with zero unavailable rows and zero traversal errors. Entries are memberships, not independent studies or unique observations. Exact scoped reader queries live in that module. The count-only audit artifact is [education-audit-20260915.json](education-audit-20260915.json).

Version 0.3.5 adds an individual-estimate table for published numeric effects that cannot pass the existing compatible-comparison gates. This exposes 29 Head Start and nine teacher-coaching entries with their published names, units and estimands. It neither invents uncertainty intervals nor places incompatible outcomes on a common axis. A missing structured p-value displays a dash; a p-value may still exist in the published finding's prose. Economic tables now retain each scenario's name as well as its measure.

The publisher has newer local study registries that are not proof of live availability. A scoped `datasetRecords(['339bbd0a7c8745119b5cb26fba624964'])` read for the WorkAdvance Dataset returned an empty, successful result at approximately 01:41–01:44 UTC. This is a conflicting local/live status requiring execution/index reconciliation, not permission to duplicate publication. The publisher was notified with endpoint, ID, scope and successful response status.

## Indianapolis

Space `f24e3bbd26304474b7e0c2a0877f4bfe`, Dataset `0ae9cde5b3f347208e35b746a6b57799`, complete collection traversal and bounded scoped hydration now render four services:

- Outreach Near Eastside program center: Monday, Wednesday, Friday, 9:30 AM–4 PM.
- We Bloom first visit, Wednesday–Friday: noon–6 PM.
- We Bloom first visit, Saturday: 9 AM–1 PM.
- We Bloom shared meal: no structured meal time; do not infer one from center hours.

The weekday We Bloom record appeared during testing following the publisher correction, without another frontend change. Service IDs respectively: `e184043c5d2b4decbc6accb33a99b522`, `4d96b581aa0f4877b9cfa293ecd3cf4a`, `6d2d5f3687934b1a9f5b00a4d1f1dbf5`, `5488bc5c6c6e4ba7b9773c456827790a`.

Version 0.3.5 reads the typed Schedule property `3a907dcf5061409b99f0808a25cf6a2d` through a strict parser for the currently published same-day weekly Indianapolis-time rules. Unknown formats and exception rules fail closed. The weekly view preserves start dates and asks readers to confirm with the public provider source. It does not calculate “open now,” infer holiday availability or promise eligibility/capacity. No contact fields are requested or stored.

## Publisher queue and remaining frontend work

1. Reconcile newer study execution/index status against the live catalog; add executed datasets to the catalog if that relation is missing. Do not republish on a broad-search miss alone.
2. For comparable education charts, supply explicit measure, estimand, unit, population/follow-up and comparison context plus numeric uncertainty where the primary source supports it. Individual tables remain useful when comparison is inappropriate.
3. Keep the outreach query contract current with all four members and the split weekday/Saturday schedules. Add typed service/meal categories, schedule verification/validity, closures, eligibility and capacity before food filtering or current-availability claims.
4. Continue explicit public-stop relations and verified public source links. Never publish private encampment locations or copied contact information.
5. Directory block-filter sources remain unsupported; collection-item membership is the supported path. Coordination is still service cards rather than a complete director matrix.

Validation: 79 tests, production build and formatting checks; browser checks of live Head Start estimates and all four outreach services with weekday ordering. No static operational data fallback was introduced.
