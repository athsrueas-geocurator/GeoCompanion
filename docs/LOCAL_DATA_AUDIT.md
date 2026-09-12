# Local-data dependency audit

## Implementation update — September 12, 2026

Atlas and questions now use `atlas-live.mjs` / `LiveAtlas.tsx`. The shipped snapshot has been removed. Build and 33 adapter tests pass. Live queries returned 34 initiatives, 8 studies and 34 non-factual claims. These do not establish full migration of the old 76/106/21 records. The previous rating matrix, pinned snapshot comparison and question continuums are not reproduced with invented values. Current atlas provides search, topic/place filters and linked findings. [Exact publisher fields and source files](PUBLISHER_DATA_GAPS.md) distinguish publication gaps from integration work.

The STAR dashboard still needs additional published-family integration. Outreach has no verified service rows in the approved destination, so its basemap remains empty. Production deployment `915cfab3` / `index-CQidbkU-.js` was verified over HTTPS with a direct Geo POST and 34 rendered initiatives; no dataset JSON request. The former URL can retain its old five-minute CDN cache independently of the new build. The following records the **pre-change** production audit.

Checked September 12, 2026. Read-only production HTTP checks and source inspection; no app changes or deployment.

## Evidence atlas is still a snapshot

The deployed entry asset is `index-DxXxnyCW.js`; its education chunk is `EducationApp-BFunCdg7.js`. The deployed education chunk contains `/data/education.json`. The live JSON returned HTTP 200 and was byte-for-byte identical to `public/data/education.json`: 76 initiatives, 106 sources and 21 comparisons/questions. These match the user's screenshot.

`src/apps/education/EducationApp.tsx` fetches that file when entering either `atlas` or `questions` and validates it through `data.mjs`. It does not first try Geo. This is the primary data source for these screens, not a temporary failure fallback.

Affected functions: counts, category/evidence filters, dot plot, list, search, initiative detail, pinned comparisons, source lists and question cards. The local five-label evidence vocabulary in `data.mjs` maps assessment values to colors; it is not computed from live study estimates.

## Other screens

| Feature | Source dependency | Remaining gap |
| --- | --- | --- |
| Education dashboard | Geo query through `education-live.mjs` | Adapter remains STAR-specific; newer published study families are not automatically added |
| Curation | Geo profile/post adapter | No bundled editorial fallback identified |
| Debates | Geo adapter | Coverage is limited by query scope; no education.json dependency |
| Connections | Geo relation discovery | No education.json dependency |
| Education location map | Geo relations with expiring browser cache | Cache is fetched Geo data, not bundled migration material |
| Profile search / app icons | Geo queries | Local preferences and public configuration are not dataset fallbacks |
| Outreach map | OpenStreetMap basemap only | No service records queried and no static substitute directory |
| Coordination | Cloudflare Worker/D1 and public endpoint configuration | Operational data, not education content |

## Is publication missing, or integration?

The publisher's current `docs/education-dashboard-data-contract.md` has many more source/Article-scoped families than Companion integrates, including Perry, Reading First, CUNY/Ohio ASAP and Abecedarian. Its `education-bounty-coverage.json` reports 200 executed, bounty-confirmed publication journals. This is recorded publisher evidence, not 200 studies or a fresh graph-wide verification in this audit. Adding another study is not required before integrating already published families.

The broad `source-to-geo-crosswalk.json` contains 339 source rows, including the 76 initiatives, 106 sources and 21 dichotomies. It still declares `publicationReady: false` and contains unresolved-discovery entries. Separate newer publication records exist, so this crosswalk cannot establish that every unresolved row is absent from Geo. It also cannot certify complete field-level replacement of the atlas snapshot.

Before removing the snapshot, reconcile each atlas field to a verified Geo property or relation: category, evidence assessment and provenance, finding, population, dates, implementation/theory, measured outcomes, methods, normalization notes, source links and question relationships. Reuse existing publications first; identify exact missing fields/relationships for the publisher rather than requesting vague additional studies. Imported assessment labels must remain distinguishable from source-reported outcomes and the user's personal writing.

## Next work

1. Reconcile atlas/questions IDs and field coverage against current publisher mappings and bounded live Geo queries; update the stale broad crosswalk or provide a reviewed replacement contract.
2. Add the corresponding paginated, space-scoped live adapters and preserve missing-data/error behavior without silently using the snapshot.
3. Integrate already-published study families through their separate outcome/unit/timepoint contracts; do not rank incompatible outcomes.
4. Remove `education.json` from the shipped build only after both atlas and questions no longer depend on it, and verify production reads after deployment.

Keep migration diagnostics here, not in visitor banners. No claim that the atlas is live or that the broad migration is complete is justified yet.
