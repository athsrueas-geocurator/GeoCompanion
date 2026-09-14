# Publisher handoff: restore atlas coverage from the original data

September 12, 2026. This is a bounded migration/reconciliation request, not a request to choose more studies or invent content. Reuse existing Geo entities before creating anything. Keep education and outreach separate.

## Where the original data is

The publisher already has the pinned source in `C:/Users/tfreestone/Code/athsrueas/geo-publisher/data/education/source/`. Its `manifest.json` records commit `3cd97449ce9ca73cccb77efe22aac69cc56131e5` and file hashes. The original checkout also exists at `C:/Users/tfreestone/Code/athsrueas/Education-Initiatives/`.

| Original file (relative to either source root) | Records | Use |
| --- | ---: | --- |
| [content/initiatives.json](https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/initiatives.json) | 76 | Program identity, intervention context, assessments and source links |
| [content/sources.json](https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/sources.json) | 106 | Bibliography, findings, methods and caveats |
| [content/dichotomies.json](https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/content/dichotomies.json) | 21 | Original questions, synthesis, program/source relationships |
| `src/lib/content-schema.ts` | — | Original field definitions |
| `research-data/dataset-catalog.json`, `dataset-profiles.json`, `initiative-dataset-links.json` | — | Dataset catalog and initiative relationships; reconcile against already published catalog resources |

The removed frontend `public/data/education.json` was an aggregate of this material, not its only copy. It remains recoverable in GeoCompanion Git history. Do not restore it as a shipped fallback.

## What the current checks establish

Complete, destination-scoped live lists returned 34 Initiative entities, 8 Study entities and 34 explicitly non-factual Claims in education space `dac259bad48a11adf97fe36857d85206`. These are different collections, not a count of independent trials or a one-to-one migration of the original 76/106/21 records.

The Initiative values inspected contain Name, Description, Web URL, Population summary and Study design. Their relations include Sources, Related, Location, Topics and Providers. The original category/evidence-rating fields were not identified in those inspected records. This does **not** prove that their equivalents are absent elsewhere on Geo.

`data/education/source-to-geo-crosswalk.json` still has unresolved-discovery rows despite newer publication journals. First reconcile it against `*-registry.json`, `*-publication.json`, `*-index-verification.json` and fresh graph reads. A stale unresolved row is not permission to create a duplicate. Do not calculate “76 minus 34 missing.”

## Exact field reconciliation requested

For each source row, return its stable original ID/slug, verified Geo ID(s), space, property/relation mappings and status: existing-and-readable, published-needs-link, absent-after-discovery, or needs-content-review. For absent fields, publish only after the normal source and content-policy checks.

| Source fields | Required Geo representation / work |
| --- | --- |
| Initiative `id`, `slug`, `name` | Verified identity crosswalk. Retain distinctions between a broad initiative, implementation/site and evaluated study; allow one-to-many mappings. |
| `category`, `tags`, `methodTags` | Reusable typed category/topic/method entities and scoped links. Return the exact IDs. Do not infer category from a title at render time. |
| `years`, `targetPopulation`, `evaluationDesigns` | Source-backed study period, population and design. Reuse existing Population summary / Study design values where equivalent; do not overwrite study-specific distinctions with broad summaries. |
| `theoryOfAction`, `inputVariablesChanged` | Linked, sourced intervention/mechanism descriptions. |
| `outputsMeasured`, `oneLineFinding`, `normalizationIssues` | Outcome/claim links with source, unit, timepoint, population and necessary caveats. Reconcile with existing numeric publications before adding prose duplicates. |
| `evidenceStrength` (initiative/source/question) | This is an imported assessment, not an effect size or the user's personal position. Identify author/provenance and review its basis. If publishable, use an explicitly attributed assessment with a documented vocabulary. The old colored dot matrix cannot be restored accurately without this contract. |
| Initiative `sourceIds`, `relatedDichotomySlugs` | Resolve source/question IDs and publish the actual relationships; no dangling local slugs. |
| Source `id`, `title`, `authors`, `year`, `url` | Reuse verified Article/source identities; attach bibliographic fields and authorship. DOI/URL matching plus publication evidence, not title-only merging. |
| Source `method`, `outcomeTags`, `finding`, `caveat`, `evidenceStrength` | Link method/outcomes and source-supported Claims with caveats; keep imported assessments separately attributed. |
| Question `slug`, `title`, `dek`, `topic`, `philosophicalDisagreement`, `betterQuestion` | Reconcile original questions to the appropriate question/debate entities. The 34 current policy Claims are not established replacements for the 21 questions. |
| `whatEvidenceSuggests`, `commonMisreadings`, `whatWouldChangeOurMind` | Review as imported synthesis, preserve attribution, and link evidence. Do not publish this as Thomas's personal writing. |
| `continuum` (poles, position, uncertainty bounds, confidence, explanation) | Review provenance before publication. These are not statistical confidence intervals. Do not fabricate or derive new numeric positions from unrelated trial outcomes. |
| Question `keyInitiativeSlugs`, `sourceIds` | Resolve and publish question-to-initiative and question-to-source relations. Return supported/opposing claim relations where applicable. |
| `landingPriority` | Optional presentation ordering, not evidence strength. May be omitted if unused; report that decision explicitly. |

Deliver an updated field-level crosswalk plus a small verified query example for each collection, pagination and scoped property/relation IDs. Include publication receipts for actual changes and a separate review-needed list. This supplies a concrete next scope without requesting additional primary studies.

## Already published data needing frontend integration

The publisher's `docs/education-dashboard-data-contract.md` and family registries describe more than STAR, including Perry, Reading First, CUNY/Ohio ASAP and Abecedarian. Companion's numeric dashboard currently remains STAR-specific. This is an integration backlog, not evidence that those families need republishing. Preserve each family's units, denominators, populations and timepoints when adding comparisons.

The latest catalog inventory read (2026-09-12) found 27 Dataset entities, 28 dataset/catalog parents, and 52 blocks in the Education destination. The native Datasets page has one ordered `Datasets` block; catalog resources and study-result datasets are mixed in that graph and must be filtered by their source/context relations before frontend grouping.

Publisher collection preparation has also been reconciled for WorkAdvance (23 existing Claims, 55 prepare-only operations) and Year Up (7 existing Claims, 22 prepare-only operations). Their drafts are not indexed Geo data and must not be queried by the frontend until explicitly published and independently verified. Career Academies currently has four factual Claims, but the local batch lacks the locator/typed-value coverage needed for a result table; keep those rows in context review rather than inventing dashboard metrics. See the publisher's `docs/education-result-collection-reconciliation.md` and `docs/education-result-candidate-reconciliation.md` for the evidence boundary.

The same prepare-only state now covers Early College (26 operations), NCSS3 (23), TFA/Teaching Fellows (22), Viking ROADS (20), DCMP (27), PACE (27), Enhanced Reading (24), Texas Summer Bridge (26), and MSSI (26). These drafts reuse existing Claims and have passed the shared review-binding and live-comparison checks, but they are not frontend-queryable until publication and independent indexed verification. The complete local inventory is [prepared-collection-inventory-2026-09-12.md](../../geo-publisher/docs/prepared-collection-inventory-2026-09-12.md).

Three additional catalog resources are prepared but not yet in the native catalog membership: Evidence for ESSA, National Student Clearinghouse Research Center Enrollment Insights, and State Longitudinal Data Systems. Their metadata batches and the append-only catalog membership extension passed complete all-space identity and schema checks; the frontend should query them only after the extension and resource records are published and independently indexed.

Teacher Incentive Fund also has a prepare-only 24-operation result collection for eight Table VI.4 Claims. It preserves annual horizons from one experiment and omits standard errors because the report does not print them; add it to frontend collection discovery only after publication and indexed verification.

The San Francisco ethnic-studies RDD now has a prepare-only 19-operation collection for three local-IV Claims. Keep its GPA-cutoff pilot separate from the later districtwide expansion; the attendance value uses proportion scale `0.21` while its displayed unit is 21 percentage points.

Frontend priority is tracked in [DASHBOARD_DATA_PRIORITY.md](DASHBOARD_DATA_PRIORITY.md). Existing source-overlap and category relations already enable initial comparison and atlas work; space icons are parallel polish for the app selector. Queue one primary-space Avatar relation plus one immutable IPFS URL for Education datasets and the outreach space; both currently return zero Avatar relations. Prepared Education batches remain intentionally unavailable to frontend queries until they are published and independently indexed, while already-indexed Perry, Reading First, Saga and coaching collections remain available for renderer work.

## Outreach: not a restoration from education JSON

The approved destination is Public good, `f24e3bbd26304474b7e0c2a0877f4bfe`. A complete live destination query returned 14 space/navigation entities and no service directory rows. The publisher's `docs/indianapolis-outreach-directory.md` still records queued research/modeling with no verified rows or publication. Its `data/indianapolis-outreach-directory/` contains destination discovery, not a completed directory.

Use that existing specification and its original named-provider seed list. There is no verified outreach dataset in the education JSON to “add back.” Research and publish a verified initial service cohort in the approved space, then expand the full requested directory. One entity/row per service/program/location, with distinct organization, schedule and public-location relations.

Minimum frontend contract: service and organization IDs; service types; public address and verified coordinates; fixed/mobile/rotating/undisclosed location mode; service area; timezone, weekday/time/recurrence and exceptions; eligibility, referral/appointment/capacity rules; verified schedules and public contact-source links only; official source, verification dates and confidence. Do not copy contact names, phone numbers, email addresses or create contact-role Person entities. Unknown stays unknown. Flag schedules not confirmed within six months. Never publish intentionally private encampment locations or turn organization headquarters into a service stop without verification.

Return exact type/property/relation IDs, dataset membership, receipts and a complete sample query. That unlocks the existing outreach map and subsequent weekly-help/food/coordination views. Keep its queue, records and journals under `data/indianapolis-outreach-directory/`; no education bounty links or personal editorial content.
