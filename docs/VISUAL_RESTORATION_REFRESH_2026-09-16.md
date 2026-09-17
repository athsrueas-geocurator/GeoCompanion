# Original visuals with live Geo data

Read-only follow-up to [the original audit](VISUAL_RESTORATION_AUDIT.md), September 16, 2026. No frontend change or deployment accompanies this review. Current working-tree renderer changes are being made separately and were not modified here.

## What changed

The publisher's original-facet contract reports 76 original initiatives and 106 source identities reconciled. These are publisher inventory counts, not a fresh exhaustive API count. Original categories, method labels and dossier assessments were preserved as attributed source-record blocks, deliberately separate from Geo's reviewed Category ontology. The publisher records five reviewed Category links; it does not authorize converting all original labels into Categories.

Fresh verification at `2026-09-17T01:32:29.818Z` used the existing `datasetRecords` and `datasetBlocks` readers against `https://api-testnet.geobrowser.io/graphql`, education space `dac259bad48a11adf97fe36857d85206`. Initiative `4ecad058f12d4b68a6cf31408fde6ab5` resolves to block `6e7f2db437c64b5cb67dc98c3d8efff9`. Its Markdown contains Source category, Evaluation designs, Source method tags, Source evidence assessment, Outcomes measured, Interpretation limits and Source reference keys. Both reads succeeded without reported truncation. This spot check establishes the representation, not completeness across all records.

The sampled initiative has Types and Blocks relations, but no direct Sources relations. Its original source keys are text. Therefore identity reconciliation alone does not establish live source-overlap edges for every imported initiative.

## Restoration order

| Visual | Current opportunity | Required boundary |
| --- | --- | --- |
| Live totals and category distribution | Recreate the original dashboard's bars from discovered collection members and source facets | Distinguish original dossier categories from reviewed Geo Categories; count unique member IDs and label incomplete inventories |
| Category × assessment dot matrix | Restore the old Companion interaction using the attributed dossier assessment | One dot per initiative; assessment is the dossier's interpretation, not a paper's measured effect or community consensus |
| Method distribution | Group original source method facets and separately reviewed method relations | Publications and independent studies are different denominators; never infer design from a title |
| Source coverage and overlap | Extend existing comparison UI with shared-source matrix and zero/one/multiple-source groups | Only resolved canonical source identities count; text keys alone are not graph edges |
| Outcome charts | Extend current ObservationPanels and STAR renderer by capability | Reading First/Perry support already exists. Preserve measure, unit, population, arm, comparator, horizon and modeled-versus-observed distinctions |
| Question/topic navigation | Use the publisher's newly published Question Topics | Topic membership does not establish an answer, supporting evidence or continuum position |
| Synthesis continuums | Still requires approved positions, poles, bounds, confidence, explanation and attribution | Publisher question reconciliation explicitly holds these. Do not reconstruct positions from prose or old JSON |
| Guided evidence tour | Reusable ordered Geo collection of approved stops | Do not reuse the old hardcoded narrative as the user's writing |

## Dynamic design

1. Discover ordered catalog/block membership using existing bounded, cursor-aware readers. Hydrate member IDs, not a fixed study-name list.
2. Normalize each record into facts plus provenance: entity ID, space, property/relation ID, attribution and completeness. Keep original source facets in their own namespace.
3. Select renderers by capabilities: categorical facet, resolved source edges, compatible estimate with uncertainty, matched arm pair, or explicit economic scenario. Unknown fields remain inspectable; missing capabilities do not become zero values.
4. Derive filters, labels, chart groups and counts from normalized records. Geo edits and new compatible records change the presentation on refresh without a deployment.
5. Reuse the persistent browser cache and bounded refresh coordinator. Replace a record's derived facts after successful refresh so removed relations and edited values do not accumulate. Failed refreshes must not overwrite successful data with emptiness.

### Markdown bridge versus durable contract

A narrow adapter can read the published original source-record format, validate its section structure and preserve attribution. It must reject ambiguous or duplicate sections, keep unknown records readable, and never silently substitute bundled `original-facet-contract.json`. The local publisher contract is a migration aid, not the website's runtime data source.

The preferred long-term contract is structured, attributed source-facet fields/records linked to the initiative or source. This does not require promoting source labels into a universal taxonomy. It does require agreement with the publisher on stable property IDs and attribution. Arbitrarily edited Markdown is not a reliable database schema.

## Publisher follow-up

Before requesting more publication, inspect the original catalog's complete membership and linked blocks. Check whether source reference keys already have a live, scoped key-to-entity mapping or resolved relations. If neither exists, request those mappings/relations with direct-read evidence, rather than shipping the local crosswalk in the frontend.

Question Sources currently has a Paper-only constraint according to publisher reconciliation; mixed source types and continuum synthesis remain a modeling decision, not an unexecuted upload. Do not force articles/resources into Paper merely to satisfy that relation.

## Evidence and code pointers

- Original [EvidenceDashboard](https://github.com/athsrueas-geocurator/Education-Initiatives/blob/3cd97449ce9ca73cccb77efe22aac69cc56131e5/src/components/dashboard/EvidenceDashboard.tsx): totals, category/assessment/method bars and source coverage.
- Original continuum/tour paths and historic screenshot inventory: [original audit](VISUAL_RESTORATION_AUDIT.md).
- Current readers: `src/apps/education/atlas-live.mjs`, `dataset-data.mjs`, `block-capabilities.mjs`.
- Current numeric rendering: `src/apps/education/ObservationPanels.tsx`, `observation-adapters.mjs`, `CollectionPlot.tsx`.
- Publisher sibling repository: `docs/original-facet-contract-2026-09-16.md`, `docs/original-category-taxonomy-decision-2026-09-16.md`, `docs/original-question-reconciliation.md`.

The first implementation slice should be the live source-facet adapter plus category/assessment overview. Follow with canonical source-overlap expansion. Neither requires waiting for continuum synthesis, nor should either claim all source records have reviewed ontology classifications.
