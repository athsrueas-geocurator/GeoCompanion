# Dynamic questions and arguments

Implemented September 12, 2026. The app's static code defines discovery boundaries, graph semantics, UI components and resource limits. Geo supplies the questions, classifications, descriptions, topics, evidence links and sources. No Krueger/Hanushek Claim ID, author summary or argument text is embedded in the runtime.

## From graph to screen

| Static rule | Live input | Screen / browser operation |
| --- | --- | --- |
| Education datasets space + Claim type + explicit Is factual=false | Paginated destination-scoped Claims | Research arguments question list, including claims without the old Debate tag or education words in their titles |
| Topics edges on those questions | Distinct topic IDs/names | Topic filter derived from loaded questions; membership is by ID |
| Case-insensitive word matching | Names, descriptions and topic names | Local search, including author names when present in descriptions; alphabetical ordering without extra calls |
| Selected Claim ID + current space | Scoped values and outgoing argument/source edges | One-hop argument view, loaded on selection |
| Supporting/Opposing relation identity and direction | Proposition -> argument | Separate supporting and opposing sections; no inference from text, shared source, topic, or votes |
| Related claims relation | Explicit contextual links | Optional Related claims disclosure, not treated as support |
| Sources relation + source-locator text | Source titles, links and locators | Citation links and exact published reference text; source Articles are endpoints, not automatically crawled |
| Explicit factual flag | True, false or missing | Checkable claim / Position / Claim labels; checkability does not mean truth, and models remain models in the published text |
| Selected target + navigation history | Next immediate neighborhood | Follow arguments and return; a repeated node truncates history instead of creating a recursive cycle |

Entry points: default Research arguments view under Debates & signals; the same `Arguments` component in Questions & evidence details. The dashboard now links to the debate explorer instead of carrying the hardcoded affordability paragraph. Existing Public conversations and its local editor preview remain a separate tab; they still use the older tagged/title-based discovery and response counts. This change does not claim to repair that legacy global discovery or merge its tallies into research evidence.

## Read contract

Code: `src/apps/education/argument-data.mjs`; presentation: `ArgumentExplorer.tsx`, `arguments.css`. Read-only POST requests go directly from the browser to `https://api-testnet.geobrowser.io/graphql`; no wallet, Worker, D1 or VM involvement. New query shapes were run against the real API before integration; browser reads also succeeded with CORS. Published quantitative request/rate limits remain unverified.

Discovery uses `entitiesConnection`, 25 Claims per cursor page. It selects only five relevant value properties and scoped Topics relations (51 maximum per question; truncation is rejected). Each load action follows up to four sequential pages, then offers Load more if needed. This bounds one action to 100 question rows. Search and topic filters apply to the questions loaded so far; a remaining-page control stays available. The list makes no claim of covering every education discussion on Geo.

The root space, Claim type and property IDs are schema/configuration, not a static list of content. Initial scope is Education datasets `dac259bad48a11adf97fe36857d85206`; additional spaces require an explicit membership policy rather than unbounded graph crawling. New questions in this scope with the verified classification appear after refresh/expiry without rebuilding. New unsupported relationship types or new application tools still need code changes.

The selected-node query reads scoped values and 25 outgoing relation edges per page with compact target values. It follows at most 20 pages / 500 edges per selection. It rejects truncated values, repeated cursors, malformed targets, wrong-space values/edges and mismatched direction. Missing targets remain unavailable. It does not silently render a partial argument set as complete. Target display names may use Geo's resolved name when no scoped Name exists; descriptions, classification and locators never fall back across spaces.

Verified relation IDs from the [publisher contract](https://github.com/athsrueas-geocurator/geo_publisher/blob/main/docs/class-size-debate-publication.md):

- Supporting: `1dc6a843458848198e7a6e672268f811`
- Opposing: `4e6ec5d14292498a84e5f607ca1a08ce`
- Related claims: `504e5776788844f6a77dba3ee811d8f0`
- Sources: `49c5d5e1679a4dbdbfd33f618f227c94`
- Is factual: `da4a6c1f9d4446f9832ff3b49a4400ef`
- Source locator: `84dacbddca6a44079edb5e11a4c66b40`

The older atlas generic Related property has different semantics; it remains for the older program/evidence contract. The new argument component reads the actual Related claims property. Do not globally replace all atlas relation IDs.

## Browser computation and caching

One shared module cache holds up to 64 successfully parsed response pages, with a five-minute TTL per page and oldest-insertion eviction. Keys include full query, variables, space, selected ID and cursor. Concurrent identical reads share one in-flight request. No graph content is written to local storage, cookies, IndexedDB or a server. Closing/reloading the tab starts a new cache; ordinary static assets retain their HTTP behavior.

Refresh clears this cache and reloads discovery and the selected claim. Request generations prevent old in-flight responses from repopulating the cleared cache. React lifecycles ignore responses for obsolete selections. A shared request already in flight may finish after a component unmounts (maximum 25 seconds); it is not tied to one subscriber's abort signal. There is no background polling, recursive prefetch or periodic refresh. Errors and malformed payloads are never cached as success, and retry remains explicit.

Browser work consists of deduplicating IDs, constructing topic sets, filtering/sorting questions, grouping explicit outgoing links by role, and maintaining a navigation path. Duplicate edges to one target collapse within a role; a target legitimately linked under different roles remains visible in those roles. Counts are questions or related Claim nodes, never independent studies, votes of evidence, causal strength or cost-effectiveness scores. The STAR model-return and scenario records remain two representations of one model; no synthetic ratio or cross-study ranking is calculated.

## Verification and extension

September 12 live discovery returned 40 questions across two pages, including all six Krueger–Hanushek interpretive Claims. Selected economic proposition returned two supporters, one opposing argument, six Related claims and one source. Broad-policy objection returned three supporters and no opposing edge, correctly avoiding invented mutual opposition. Both parents rendered with their scoped descriptions and correct argument roles.

Browser checks: desktop 1280px and phones 390/320px, light/dark tokens, no horizontal document overflow; search for Hanushek narrowed to four questions without fetching; opening the projection-risk child and returning used only one new Geo read (cached parent). Requests observed went directly to Geo. Numeric/model qualifications remain source text. Node tests cover scoping, classification, malformed data, edge pagination/deduplication, repeated cursors, missing targets, in-flight reuse, TTL and refresh. Build and all 43 adapter tests passed during implementation.

Before extending: verify actual new schema/relations, preserve scope and argument direction, add representative live cases, then check desktop/mobile rendering and browser destinations. Do not turn source sharing into support or automatically collect researcher/contact identities. Outreach retains its separate contact-source-links-only contract; this education reader is not an outreach importer.

Remaining: source/study-based discovery across explicitly chosen additional spaces, incoming argument navigation, user-selected source comparisons, and quantitative dataset charts beyond the existing contracts. These are extensions, not features silently promised by the present reader.
