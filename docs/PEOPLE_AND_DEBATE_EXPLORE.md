# People & Contributions and Research Debates apps

Status: proposed September 15, 2026 from community ideas supplied by the user. This document records the direction; it does not claim new API capabilities, published records or a deployed graph view.

## Reader experience

User correction: these are **two new standalone apps**, not extensions of Education or Indianapolis Outreach. Add separate compact cards to the root app selector, with their own routes, navigation and scope selection. Working titles:

- **People & Contributions:** who authored, published, curated or otherwise explicitly relates to this material?
- **Research Debates:** what propositions are disputed, which papers supply arguments, and who considers the discussion current?

Each app can explore a chosen Geo space, dataset or entity across domains. Education and outreach are possible scopes, not parent apps. Share reader/cache/graph primitives rather than copying them. Existing education debate screens remain available; a later navigation consolidation is a separate decision.

The root selector follows the existing compact-card and triangle-brand design. If either app has a verified primary Geo space, read its icon dynamically. Until a primary space is selected, use the shared fallback; do not invent a space or silently assign Education. Missing icons for selected primary spaces belong in the publisher queue. These apps may explore multiple spaces without owning a new space, and creating any new space still needs the user's approval.

These are relationship diagrams, not geographic Leaflet maps. Start with a small selected neighborhood, labeled edges and a synchronized accessible list. Select a node to see its evidence and expand one step. Provide relation filters, search, back navigation and a mobile list-first layout. No giant graph of everything in a space.

Examples of useful paths: dataset → cited paper → author → other papers in the selected scope; topic → relevance assessment → sources; proposition → opposing argument → paper. Preserve the actual published edge direction even when the visual reading direction differs.

## Keep the roles distinct

| Relationship | Required evidence | Never infer |
| --- | --- | --- |
| Paper author | Explicit authorship relation and resolved Person entity | Author agrees with every claim citing the paper |
| Geo contributor | Public attributable edit/publication history exposed by a verified API | Editor endorses the content or is its academic author |
| Curator | Explicit curation/collection relation with attribution | Every member of a space curated every record |
| Organization affiliation | Explicit affiliation, with dates when available | Current affiliation from an undated historical link |
| Stance or response | Public response semantics and attribution, where actually available | Identities from aggregate vote totals |
| Subject expertise | Explicit, attributable, sourced assessment | Expertise from node degree, edit volume, popularity or wallet balance |

A Geo user/profile and a Person entity remain separate until a verified identity relation connects them. Never merge by matching names. A publishing wallet may represent automation or a team; label the observed role rather than inventing a person behind it. Do not collect contact details, private activity or location histories.

For the first version use neutral roles and contribution counts with scope/time context, not expert badges or a composite reputation score. If expertise assessments are later desired, they should be inspectable and contestable claims too.

## Academic claims and relevance assessments

Keep three separate layers:

1. **Research proposition:** a precise claim attributed to a paper or author, with a source locator and relevant population, outcome, date and limitations.
2. **Argument relationship:** explicit supporting, opposing or related claims. A shared topic/citation does not establish disagreement. Different populations, methods or estimands may explain apparently different results.
3. **Relevance assessment:** a separate claim such as “Whether X improves Y is an active debate in field Z as of September 2026.” This is a structural example, not publishable editorial copy.

The relevance claim should identify the topic, academic community, as-of/review date, assessing curator, reasons and cited evidence of an ongoing debate. Link to identifiable positions or responses rather than assuming that a recently published paper constitutes a controversy. Distinguish active, historically important and unresolved questions; an old unresolved dispute is not automatically a current discussion.

Readers must be able to inspect and contest the relevance claim independently of the research proposition. Community stance, curation and veracity responses retain their separate meanings and denominators. Display them as Geo community responses, never academic consensus. Do not sum them into a truth or relevance score.

Initial ordering should offer named, transparent choices such as recently assessed, topic, or community curation. Show the assessment date and support/opposition when available. “Trending” requires timestamped activity and a defined time window; lifetime counts alone cannot establish a trend. Stale assessments remain visible as dated assessments rather than silently becoming current facts.

The initial Companion remains read-only: link to the exact assessment on Geo for voting. An in-app vote flow needs separately verified wallet, governance and API support; local preferences must never masquerade as published votes.

## Data contract and publisher preparation

Reuse verified native types and properties before proposing new schema. These are semantic requirements, not invented property IDs:

- Person, organization, paper, topic, claim and profile identities, with actual space memberships.
- Explicit paper authorship and claim-to-source links, source locators, argument polarity and direction.
- Relevance-assessment subject, academic community, attribution, dates, evidence and contesting/supporting arguments.
- Public contribution provenance, only if an API exposes it with sufficiently clear actor and event semantics.

The publisher should inspect existing records first, identify reusable relations, and produce a small proposed mapping with exact IDs and read queries. Begin with one existing education debate; do not bulk-extract claims or publish machine-written assertions as the user's views. Preserve quotes versus paraphrases and the actual authors' qualifications. Missing fields become a bounded publisher queue with successful-read evidence, not guessed graph edges.

Follow [Geo API diagnosis](../../geo-publisher/docs/geo-api-diagnosis.md) before query changes or absence claims. Verify edit-history/identity/response capabilities separately; existing aggregate responses do not establish per-user interaction support. If history is unavailable, ship the explicit people relationships and omit the contribution layer.

## Browser implementation plan

Existing foundations: [Connections](../CONNECTIONS.md), [dynamic arguments](DYNAMIC_ARGUMENTS.md), [living Geo design](LIVING_GEO_DESIGN.md), and `src/apps/education/connection-data.mjs` / `argument-data.mjs`.

1. Register two lazy-loaded apps in the root shell (proposed routes `#/people` and `#/research-debates`). Give each independent selected-space/collection/entity scope and filters. Extract reusable graph readers from the existing education implementation rather than inheriting its fixed education/profile roots. Keep an allowlist of supported relation semantics; scope additions are configuration, not bundled people or claim lists.
2. Discover members through complete or explicitly partial paginated collections. Read one-hop edges and hydrate only visible/selected IDs. Preserve source space, relation ID, direction and attribution; distinguish missing, conflicting and unavailable reads.
3. Derive typed nodes and edges in the browser. Deduplicate entities by ID while retaining multiple scoped assertions. Keep opposing and supporting edges separate, including when different spaces disagree.
4. Reuse shared bounded reads, in-flight deduplication, expiry and explicit refresh. Cancel obsolete requests on scope changes. Expand on demand; no background whole-graph crawler or VM mirror.
5. Render a lazy graph component plus the equivalent list. Initial proposed caps: 50 visible nodes and 100 edges per expansion, explicitly partial when capped; tune after measurement. Respect reduced motion and keyboard navigation. Do not use node size or layout as an undocumented measure of authority.

## Delivery sequence and acceptance

- [ ] Read-only capability audit: verify authorship, identity, edit provenance and relevance-claim representation; record exact queries and limitations.
- [ ] Root selector and app boundaries: two independently navigable apps, shared branding and reusable graph components, dynamic primary-space icons when configured, separate scope preferences.
- [ ] People & Contributions app: explicit published roles, selected-scope expansion and accessible list. Same-name people remain distinct; absent identity links remain absent.
- [ ] Research Debates app: reuse explicit arguments and paper/source links; no inferred polarity. Changed/deleted Geo relationships update after refresh without a deployment.
- [ ] Publisher prepares one reviewed relevance assessment and its source-backed academic positions using verified schema; publication follows existing authorization and editorial rules.
- [ ] Assessment card: show field, as-of date, attribution, evidence and separate community responses; open the exact claim on Geo to participate.
- [ ] Verify mobile layout, keyboard/reduced-motion use, cycles, cross-space conflicts, partial/error responses and network budgets. Adding compatible people/claims must require no member-list code changes.

No frontend deployment or Geo publication is performed by recording this plan.
