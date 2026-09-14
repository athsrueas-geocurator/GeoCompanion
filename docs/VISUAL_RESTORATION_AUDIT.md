# Restoring visual exploration from Geo

Audit requested September 13, 2026. Live API capture time reported by the machine: `2026-09-14T02:53:20.583Z` (September 13 in Indianapolis). This is a source/history and read-only API audit, not a new frontend deployment or a screenshot verification of every historic release.

## Finding

Moving the atlas off bundled JSON removed visual functionality as well as the static dependency. The original evidence distributions, category-by-assessment dot matrix, comparison tray and synthesis continuums have no equivalent in the current live atlas. Conversely, many numerical observations already exist on Geo but are only rendered as tables because the chart contract is too narrow. Restoring these are two different jobs: reconcile missing semantics with the publisher, and implement reusable visual renderers for supported live records.

Do not restore `/data/education.json`, publish chart screenshots as a substitute for observations, or extract numbers/classifications from prose. Geo supplies canonical records and relationships; the browser groups, filters and draws them. Local cached query results are fine; a bundled migration fallback is not.

## Historic visual inventory

Inspected [Education-Initiatives at 3cd97449](https://github.com/athsrueas-geocurator/Education-Initiatives/tree/3cd97449ce9ca73cccb77efe22aac69cc56131e5), the local clean checkout at that revision, and [GeoCompanion at b3cf132](https://github.com/athsrueas-geocurator/GeoCompanion/tree/b3cf132). History proves code existed; it does not independently prove every component was deployed. The user supplied the old Companion dot-matrix screenshot.

| Earlier visual or interaction | Source evidence | Geo data needed | Current restoration boundary |
| --- | --- | --- | --- |
| Initiative/source/dataset totals | Original `src/components/dashboard/EvidenceDashboard.tsx`; old Companion `EducationApp.tsx` | Explicit collection membership, entity types and unique IDs; separately count initiatives, sources, questions and datasets | Membership/count machinery exists. Restore live totals without retaining the old 76/106/21 as constants or claiming all are trials. |
| Initiative assessment bars | Original `EvidenceDashboard.tsx` | Initiative → attributed assessment → assessment category; vocabulary, rubric, author/source and scope | No assessment mapping found on the 35 inspected initiatives. Publisher review needed. |
| Source study-design bars | Original `EvidenceDashboard.tsx` | Source/study → design concept, with explicit choice of counting publications or distinct studies | Some Study design text exists; a complete source-method mapping is not established. Do not infer RCT from a title. |
| Initiative category bars | Original `EvidenceDashboard.tsx` | Initiative → category concepts; stable IDs and a defined multi-category counting rule | Three initiatives have Category relations already; atlas ignores this relation. Both adapter work and coverage reconciliation needed. |
| Category × evidence-assessment dot matrix, linked list and filters | Old Companion `src/apps/education/EducationApp.tsx` | Initiative ID, category and attributed assessment; links to detail/source records | Removed by live-atlas migration. Categories alone cannot recreate the second axis. One dot must continue to mean an initiative, not a Claim/result row. |
| Pinned side-by-side initiative comparison | Old Companion `EducationApp.tsx`, compare dialog | Selected initiative IDs, findings, populations, limitations and Sources relations | Source overlap can be computed now. Full equivalent context needs field mapping. Keep selection IDs locally and re-resolve them after graph edits. |
| Source overlap/counts in comparison | Same compare dialog; original source-coverage counters | Actual canonical source IDs shared by selected initiatives | All 35 inspected initiatives have Sources links. This can be restored without another publication; shared papers are not proof of independent replication. Split zero-source from one-source coverage instead of the original ambiguous remainder count. |
| Question continuum: two poles, position, uncertainty band and confidence | Original `src/components/evidence/EvidenceContinuum.tsx`, `src/app/continuums/ContinuumsExplorer.tsx` | Attributed synthesis with left/right poles, 0–100 position, lower/upper bounds, confidence and explanation; source and question links | All 21 Questions exist, but their inspected records have only identity/description/URL/slug and Types relations. No continuum or supporting source/initiative links found there. Bounds are editorial uncertainty, not statistical confidence intervals. |
| Six-stop visual evidence tour and source ledger bars | Original `src/components/tour/EvidenceTour.tsx` | An ordered collection of approved claims/posts, selected initiatives and evidence links; assessments for the ledger | Original stop text and slug selections were hardcoded. Do not republish that text as the user's voice. An approved Geo collection can drive a reusable tour. |
| STAR grade/arm estimate plot with intervals | Old Companion `EducationDashboard.tsx`; current `CollectionPlot.tsx` | Typed effect and SE, unit, grade, arm, comparator and Study/estimand context | Still supported dynamically: all 8 live STAR rows pass current eligibility. This was already a live-Geo numerical chart in the inspected older revision. |
| Debate response bars, connection summaries and education Leaflet map | Older Companion debate/connection/location components; current successors | Explicit claim relations and separate response counts; shared entity edges; public Place points | These remain live features, not lost JSON charts. Extend their usefulness rather than reimporting static copies. |
| Outreach service map / weekly grid | Current outreach shell and user requirements | Directory → service offerings → public locations and verified recurring schedules | A planned feature, not a chart lost from education JSON. The publisher's current outreach contract is still a draft. |

The original [content schema](https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/src/lib/content-schema.ts) and `content/{initiatives,sources,dichotomies}.json` define the migration inputs. The publisher has the same pinned files under `data/education/source/`. The earlier [field reconciliation handoff](PUBLISHER_DATA_GAPS.md) remains relevant, but its historical counts are superseded by the following scoped observations.

## Fresh live observations

Public GraphQL endpoint: `https://api-testnet.geobrowser.io/graphql`. Reads used the actual application adapters and their pagination/validation, with Education asserting space `dac259bad48a11adf97fe36857d85206`. This is not a graph-wide absence search or a source-correctness review of every value.

- The ordered catalog block `2279edef1bbe479c872caeb72ee90022` resolves 27 Dataset entries. These mix catalog resources and result datasets; 27 is not a chart or study count.
- Complete Initiative and Study lists resolve 35 and 8 records respectively. All have Sources links. Of 35 initiatives, 14 have Study design text, 3 have Topics links and 3 have Category links. Do not calculate missing original initiatives as `76 - 35`: mappings may merge, split, or use other entity types.
- Category relation `06c899fb04334e679feb1fd56687c3d6` is already used for U.S. literacy education and Early childhood education. The current `atlas-live.mjs` parser does not expose it. These concepts are not established equivalents of all 13 original intervention categories.
- Question Dataset `b1f70bc05d4e454dab2448a0e3172195` resolves 21 Questions through **Blocks → Collection item**, not direct Dataset → Collection item. Full inspected question records show no original continuum fields or evidence links. An empty direct-membership query would have been a false missing-data conclusion.
- Education map traversal resolves 12 places, 7 with usable points and 5 without. Missing points in this adapter: Florida, Maryland, Ohio, Tennessee and Texas. It reads one point property in the Geography space; points elsewhere may exist. Existing city/country points do not certify school sites or implementation locations. Record totals on a marker include findings and datasets, not just programs.

### Existing numbers the renderer does not use visually

| Live collection family | Observed records | Appropriate next visual |
| --- | --- | --- |
| STAR experiment | 8 estimates, complete collection, current `canPlot=true` | Preserve the existing grade/arm interval chart. |
| Perry | 24 observed proportions; 8 earnings means; 27 IRRs; 24 benefit-cost ratios; separate cost and 2 horizon-comparison members | Paired group dots by outcome/population/follow-up; separate economic scenario plots filtered by perspective and assumptions. Collection memberships may reuse records. |
| Reading First | 63 impact representations across eight collections, plus 12 proportion-mean pairs and 21 numeric-mean pairs | Faceted effect plots; actual-versus-estimated-counterfactual dumbbells with explicit measure/unit/timepoint grouping. Alternative representations are not independent findings. |
| Saga | Twelve result collections totaling 135 memberships, including trial, pooled, follow-up and assumption-bound collections | Within-trial/outcome/estimand panels; keep pooled findings and assumption-dependent bounds distinct. Membership totals are not unique trials. |
| Teacher coaching | 3 instruction and 6 achievement rows | Separate synthesis panels after subgroup/outcome semantics are verified. Overall and subgroup estimates overlap. |

All sampled non-STAR collections return `canPlot=false`. [plot-contract.mjs](../src/apps/education/plot-contract.mjs) requires the literal unit `percentile points`, one common Study, grade, intervention arm, comparator and estimand. It is deliberately not a universal plot detector. [dataset-data.mjs](../src/apps/education/dataset-data.mjs) can read many more typed fields, but `estimate()` only recognizes Effect estimate value plus Standard error. Therefore already-published Observed proportion, Observed monetary mean, Real internal rate of return, Benefit-cost ratio and native confidence bounds need adapters/renderers, not duplicate publication.

These proposed numerical visuals extend the older site; they are not all charts proven to have existed historically. Source-backed interpretation and compatibility still need acceptance tests before rendering them.

## The graph contract to build toward

Use established Geo ontology IDs wherever equivalent. The following is a semantic model, not authorization to create properties with these names:

```text
Catalog block --Collection item--> Dataset
Dataset --Blocks--> typed collection block --Collection item--> result
result --> Study / source version / population / arm / comparator
result --> outcome measure / instrument / follow-up / estimand
result --> typed numeric value + unit/scale + uncertainty + source locator

Initiative --> category / evaluated implementation / Study / Sources
Assessment --> assessed initiative or claim + rubric/category + author/source
Question --> attributed synthesis + evidence links + optional reviewed continuum
```

For a paired-means plot, the join key must identify the same study, cohort/population, outcome/instrument and follow-up, with distinct arms. Two rows with similar labels are insufficient. A source's estimated counterfactual is not automatically an observed control mean. For an interval plot, distinguish reported intervals from calculated approximations and assumption bounds; missing uncertainty can produce a point-only display, never an invented interval.

For economic plots, preserve cost amount, currency, price year, denominator, accounting perspective, horizon, discount rate and scenario assumptions. Only link cost and outcome when their implementation/cohort and accounting scope match. A source-reported modeled return can be visualized as such; it must not become an observed affordability score. Equal units across studies do not establish comparable measurements.

For category/assessment charts, query category labels dynamically, but retain stable IDs for grouping. Multi-category membership needs an explicit rule: one primary category, or multiple category counts clearly treated as memberships. Multiple assessments should remain attributable; do not silently choose the strongest or average conflicting judgments. Missing classifications need an unclassified group, not a fabricated rating.

## Browser assembly and change handling

1. Query ordered catalog membership, then only the selected dataset's blocks and paginated result members. Hydrate required fields in bounded batches; retain asserting-space provenance.
2. Normalize by reviewed property IDs into observation kinds: effect, mean/proportion, cost, modeled return, assessment, location. Read labels from Geo; do not select chart semantics by title regex.
3. Compute facets, source intersections and compatible groups locally. A code-owned capability registry chooses a bar, dot matrix, paired-mean, interval or scenario renderer from validated semantics. Unsupported/incomplete records remain readable in the table.
4. Cache successful parsed responses, share in-flight reads, and preserve only IDs for selections. Refresh replaces membership: additions appear, removals disappear, renamed entities update, and changed units invalidate the old grouping. Do not union cached rows forever.
5. Keep filtering responsive without querying again for each visual interaction. Lazy-load detail and map tiles. Full-collection totals require complete membership; bound large datasets and distinguish a loaded subset from a complete collection.
6. Verify exact source values, expected grouping, empty/malformed data, removals, conflicting facts, partial pagination, currency/scale changes, mobile layout and keyboard/table alternatives. Ordinary supported Geo edits must change the visual after refresh with no rebuild.

The existing reader's two-minute memory cache is reusable. Its serialized cache bound is not a network transfer cap. This architecture needs neither VM data forwarding nor Cloudflare-hosted copies of canonical education records.

## Publisher queue: bounded requested work

1. **Category and design reconciliation:** resolve original `category`, `methodTags`, source `method` and `evaluationDesigns` to existing concepts and stable scoped relations. Start with existing IDs; report existing-readable, needs-link, absent-after-discovery or review-needed for each mapping. Return an explicit initiative collection if the intended atlas is narrower than all Education initiatives.
2. **Assessment review:** reconcile `evidenceStrength` separately from facts. Supply author/provenance, rubric, scope, vocabulary and supporting sources; keep unsuitable or unattributed assessments in review. No automatic conversion to the user's opinion.
3. **Question visual context:** reconcile original `continuum`, `keyInitiativeSlugs`, `sourceIds`, caveats and synthesis against each existing Question. Publish only reviewed, attributed material; preserve intentional missing Answers. Do not invent positions to populate a chart.
4. **Existing result semantics:** return exact property/relation IDs for measure, scale, instrument, cohort, timepoint, trial identity, comparator, estimand and observation kind for each chart family. Identify which fields already exist versus need structured links. Do not republish the numerical rows merely because Companion currently shows tables. Prepared result collections need normal review, publication and indexing before catalog discovery can use them; respect the publisher's current pause.
5. **Map context:** inspect the five unresolved place coordinates across valid source spaces, supply reviewed mappings, and distinguish region/country reference points from implementation sites. Do not fabricate point locations for statewide programs. Keep outreach public-stop coordinates and contact-source-only rules in its separate queue.

Acceptance: a refreshed field-level crosswalk, complete scoped example queries, explicit remaining review gaps, and indexed receipts for any authorized change. This audit itself writes nothing to Geo.

## Implementation order

First restore source-overlap comparisons and live category/source coverage summaries using present relationships. In parallel with publisher reconciliation, add paired-mean and economic-scenario renderers for Perry and unit-aware Reading First panels. Then restore the dot matrix and continuums only when their assessment/synthesis contracts are approved. Add broader compatible estimate panels and geographic coverage improvements afterward. No universal cost-effectiveness ranking is justified by this audit.

See [living Geo design](LIVING_GEO_DESIGN.md), [publisher dashboard contract](https://github.com/athsrueas-geocurator/geo_publisher/blob/main/docs/education-dashboard-data-contract.md), and the [canonical publisher queue](https://github.com/athsrueas-geocurator/geo_publisher/blob/main/publishing_queue.md).
