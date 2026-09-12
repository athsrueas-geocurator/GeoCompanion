# Hardcoded content and discovery audit

September 12, 2026 · source baseline `eba5e11`.

This is a source audit of the visitor application, its Geo adapters and remaining public data files. It does not establish a fresh inventory of everything currently published on Geo. No application behavior or publication was changed by this audit.

The principal remaining problem is hardcoded selection and interpretation, rather than bundled numerical results. New Geo records can exist without appearing on a screen whose query or renderer only understands one study.

## Prioritized findings

### 1. The numerical dashboard still selects only STAR

Evidence: [education-live.mjs](../src/apps/education/education-live.mjs) fixes the study ID, four grade IDs and labels, two intervention IDs and labels, and a comparator ID. It requests 20 estimates and rejects additional pages. [EducationDashboard.tsx](../src/apps/education/EducationDashboard.tsx) fixes the study description, years, outcome explanation, grade/intervention controls, legend and suggested studies. Axis defaults and the one-study label also assume this dataset.

The effect estimates, standard errors, sample sizes and associated value fields already come from Geo. Their values are not a JSON fallback.

Replace the fixed study selection with a paginated, explicitly scoped study/dataset catalog. Read study metadata and linked grade, intervention, comparator and outcome labels. Derive available filters from those records. Select a compatible renderer using a validated data contract; retain chart mathematics in code.

Publisher documentation already describes additional families: see [existing integration backlog](PUBLISHER_DATA_GAPS.md#already-published-data-needing-frontend-integration) and the [dashboard contract](https://github.com/athsrueas-geocurator/geo_publisher/blob/main/docs/education-dashboard-data-contract.md). This is not a blanket request to republish them. First verify which metadata and membership relations each family supplies, then request only missing fields. Do not combine different units, populations, timepoints or modeled versus observed outcomes into an unjustified ranking. Locally calculated intervals must remain identified as calculations.

Acceptance: another supported published study appears without adding its entity ID or prose to the component; unsupported or incomplete records receive an honest unavailable state.

### 2. Outreach shows preparation states without querying for services

Evidence: [OutreachApp.tsx](../src/apps/outreach/OutreachApp.tsx) unconditionally renders preparation/no-service text. [OutreachMap.tsx](../src/apps/outreach/OutreachMap.tsx) provides a basemap but has no service discovery or markers. This demonstrates an unconnected frontend, not that Geo currently has no outreach data.

Implement a separate adapter for the approved Public good space and exact directory membership. Query service/program/location records, schedules, eligibility and verified public locations. Derive directory, weekly, food and coordination views from the same normalized records. Drive empty/loading/error states from the query result. The Indianapolis starting map center can remain configuration.

Dependency: obtain and verify the publisher's exact membership, type, property and relation contract and sample records. The [September 12 intake](../../geo-publisher/docs/indianapolis-outreach-intake-2026-09-12.md) is the bounded handoff. It is not proof of publication. Do not use the raw research package as a fallback.

Contact-source links only: no copied contact names, phone/email values or other contact details in Geo imports, frontend responses, caches or prose. Public service addresses/coordinates are separate operational fields and require privacy review. Never expose private encampment locations.

Acceptance: verified published services determine what appears; unknown schedules are not presented as available help today.

### 3. Reference links assume destinations instead of resolving them

Evidence: [Curation.tsx](../src/apps/education/Curation.tsx) routes references to Books if the target belongs there, otherwise to the editor profile. [curation-live.mjs](../src/apps/education/curation-live.mjs) specifically queries Books names. [LiveAtlas.tsx](../src/apps/education/LiveAtlas.tsx) constructs every reference URL with the education space; [atlas-live.mjs](../src/apps/education/atlas-live.mjs) does not retain target space membership. [connection-data.mjs](../src/apps/education/connection-data.mjs) chooses the first target space when available.

Query and retain relevant target membership and assertion provenance. Select a verified destination appropriate to the referenced content; do not assume that an arbitrary first space is canonical. Keep the distinction between the space asserting a relationship and the space supplying the target's content.

Acceptance: a reference to a third space opens the appropriate entity there without adding that space to a component conditional.

### 4. Curation has a pinned default post

Evidence: `START_POST` in [curation-live.mjs](../src/apps/education/curation-live.mjs) initializes [Curation.tsx](../src/apps/education/Curation.tsx). The post list and ordered post content already load from Geo.

The selected post was explicitly chosen by the user, so it is not fabricated content. To make future editorial selection independent of deployment, read an editor-maintained featured/ordered collection on Geo, with a valid saved browser selection taking precedence where appropriate. Verify a real collection contract before introducing it. Keep the profile ID as an intentional ownership boundary. Do not choose new editorial priorities automatically or turn chat drafts into published copy.

Acceptance: the editor can change the featured selection on Geo and see the change without a code release.

### 5. Connections discovers spaces dynamically, but from a narrow graph

Evidence: [connection-data.mjs](../src/apps/education/connection-data.mjs) starts from the education and profile adapters and traverses only Sources, Locations and generic Related relations. Space names and displayed space options already come from query results. Supporting, Opposing and Related claims are not included in that relation whitelist.

Use a shared, app-scoped source registry and explicit supported relationship semantics. Extend education discovery to the argument relationships already used by the research reader. Add outreach only inside its own scoped view once its contract is verified. Avoid unbounded graph traversal or mixing unrelated datasets.

Acceptance: newly linked relevant spaces and argument connections become discoverable without a separate hardcoded space menu; relation meanings remain distinct.

### 6. Public conversations still uses a fixed education keyword heuristic

Evidence: [debates.mjs](../src/apps/education/debates.mjs) contains a fixed term list and title regex, a single Debate tag and a 101-relation discovery request without cursor pagination. This is the legacy Public conversations tab, not the new Research arguments reader.

Discover conversations through verified education topic, dataset, study or source associations, then request response counts for discovered IDs. Add bounded cursor pagination using the verified API schema. Keywords may remain a supplementary search tool, but should not define the whole education collection. Keep response counts separate from evidence strength and truth.

Acceptance: a linked education discussion can appear even when its title contains none of the fixed words.

### 7. The Questions screen currently discovers non-factual Claims only

Evidence: [atlas-live.mjs](../src/apps/education/atlas-live.mjs) defines question mode as Claim entities with the factual property set to false. The research argument adapter similarly starts from policy Claims. This is a fixed content-model assumption, despite the returned text being live.

During this audit the publisher reported discovering a canonical Root Question type with Answers, Topics and Sources, and is reviewing the original 21 questions for that model. No question publication batch was reported. Verify that contract and identity review before adding a separate question adapter. Preserve actual Questions and their Answers distinctly from debate Claims and their supporting/opposing arguments; do not silently reinterpret one as the other.

Acceptance: verified Question entities can drive a question screen without being republished as non-factual Claims. This is a pending integration dependency, not proof that the original questions are already live.

### 8. Retired editorial artifacts remain

Evidence: [public/data/editorial.json](../public/data/editorial.json) contains only an empty reading list. No current source reader of that file was found. [import-editorial.mjs](../scripts/import-editorial.mjs) throws immediately to prohibit static publication, but retains unreachable write code below it. [DebateBoard.tsx](../src/apps/education/DebateBoard.tsx) initializes a separate `published` selection to an empty constant without loading it from Geo.

Remove unused public output and unreachable importer code, and retire or connect the dormant reading-list feature through an approved Geo collection. No replacement query is needed merely to delete an unused empty file. Local drafts remain drafts; canonical curation already comes from Geo.

### 9. Optional collection presentation metadata

Evidence: [App.tsx](../src/app/App.tsx) fixes two app names/descriptions and primary space IDs. Space icons already load from Geo. [LocationMap.tsx](../src/apps/education/LocationMap.tsx) describes all returned locations as study areas, while its adapter discovers general education Location relations.

App titles/descriptions could come from explicit collection descriptors if the editor wants to maintain them on Geo. Do not replace “Indianapolis outreach” with a generic primary-space name that loses the app's purpose. Keep the available routes and executable components in code.

For maps, discover dataset/study grouping and distinguish study area, institution and actual service site before assigning one interpretation to every marker. Coordinates and names already load from Geo; no static location catalog needs migration.

## Already dynamic; do not re-migrate

- Atlas initiatives, studies and questions: [atlas-live.mjs](../src/apps/education/atlas-live.mjs), with scoped paginated queries. The former education snapshot has been removed.
- Research questions, arguments, explicit supporting/opposing relationships and sources: [argument-data.mjs](../src/apps/education/argument-data.mjs); see [dynamic arguments](DYNAMIC_ARGUMENTS.md).
- Curation text, ordered blocks and post discovery: Geo profile reads, not bundled editorial text.
- Education map locations and coordinates: live queries with an expiring browser cache.
- Profile search and selected public identities: live discovery plus locally saved IDs.
- App space avatars and Connections space labels: live reads.

Live does not mean exhaustive. Query scopes, supported relation types, pagination and missing publisher fields still determine coverage. A cached Geo response is not authored static fallback data.

## Keep these in code or configuration

Routes, components, accessibility labels, trusted bootstrap spaces, verified ontology IDs, endpoint configuration, validation, sanitization, chart calculations, paging/cache limits and required map attribution are application rules. Querying Geo for every constant would add requests without improving discovery. Remote content must never determine executable code or unrestricted network destinations.

The unused `SOURCE_COMMIT`/`SOURCE_REPO` exports in [public-config.ts](../src/config/public-config.ts) are cleanup candidates, not a runtime data fallback. Provenance can remain in documentation.

## Recommended sequence

1. Add dynamic study discovery and metadata to the dashboard, preserving per-family comparison contracts.
2. Verify the outreach publisher contract and connect its shared directory/schedule/map adapter.
3. Resolve reference destinations and add editor-controlled featured selection.
4. Extend Connections and legacy conversation discovery through explicit relationships.
5. Remove retired editorial artifacts and unused provenance exports.

For each adapter: fetch small scoped pages, normalize and validate once, cache by endpoint/space/query parameters, derive filters and views in the browser, and fetch details on selection. Preserve refresh, partial-coverage and failure handling without adding infrastructure narration to the visitor interface.

Verification for this audit: inspected source paths and static constants, traced readers and reference construction, and checked remaining public data/import paths. No fresh service availability census, publication, deployment or runtime test suite was performed; those belong to the implementation tasks above.
