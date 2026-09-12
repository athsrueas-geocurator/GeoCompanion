# Education debates and public signals

September 12 local integration: Public responses now reuses destination-scoped non-factual Claim discovery with cursor pagination, not title keywords or a Debate-tag requirement. It expands four pages per load action and offers more when needed. Counts retain their separate curation/stance/veracity meanings; expanding a record loads explicit argument/source relationships. Browser returned 40 Claims and live counts without errors; 54 tests and build pass. Cross-space topic/source discovery remains future work. The older tagged discovery below describes the previous release, not the current source.

## Research arguments — implemented September 12

The default debate screen now uses [dynamic questions and arguments](docs/DYNAMIC_ARGUMENTS.md): scoped nonfactual Claim discovery, live topic filters, local search, on-demand explicit supporting/opposing/Related links and a bounded five-minute browser cache. The same argument reader is available in Questions & evidence details. The older tagged discovery described below remains only in the separate Public conversations tab; it is not the new research discovery path.

## Verified contract — 2026-09-11

Endpoint: `https://api-testnet.geobrowser.io/graphql`. Native browser fetch, no private authentication, no VM proxy. Queries are in `src/apps/education/debates.mjs`. They were checked against live introspection and executed successfully.

Official source inspected: [debate ontology](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/debates/ontology.ts), [response semantics](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/responses/entity-response.ts), [response queries](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/io/queries.ts), [best-order query](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/debates/browse/debates-best-order-document.ts).

- Debate tag: `55c95b2626f8482cb9739ea99dfde438`. Tags select claims intended for debate; this is not a catalog of completed video debates.
- Sources property: `49c5d5e1679a4dbdbfd33f618f227c94`. Direct source relations are bounded at 11 per claim and retain their space context.
- `votesCounts`: objectType 0 is Entity; voteKind 0 is curation (upvote/downvote), 1 is stance (agree/disagree), 2 is veracity (verify/dispute).
- Positive and negative counts arrive as BigInt strings. The adapter rejects invalid or unsafe numeric values. Missing rows are unknown, not zero. A response batch hitting its 501-row bound is hidden instead of presenting partial totals.

## Discovery and aggregation

Search tagged entities using education, school, teacher, student, tutor, university, college, curriculum, and homework title terms. Recheck resolved titles on the client and exclude Electoral College matches. This heuristic can omit education topics and include adjacent policy issues. Do not describe it as comprehensive topic membership. The query caps at 101 tag relations and displays a coverage notice when reached. Deduplicate by entity ID, preserving all returned tagging spaces.

Counts are fetched for discovered IDs across spaces and summed per vote kind. They are recorded space-specific responses, not unique participants. The details panel exposes each contributing tally and space. Do not combine agree/disagree with verify/dispute into one support percentage. Stance percentage uses positive / (positive + negative), with the denominator visible. Sorting by most divided stances is closeness to a 50/50 split, with no representativeness claim.

Response activity sums returned curation, stance, and veracity counts as an explicitly labeled proxy. It is not views, impressions, watch time, velocity, or proof. No historical snapshots or attention pipeline are implemented. We could not establish a documented quantitative API rate limit; bounded requests, a 25-second timeout, 60-second in-memory reuse, a 10-second refresh cooldown and no background polling constrain prototype traffic. Handle rate-limit errors visibly; production rate-limit confirmation remains pending.

## First browser observation

29 unique education-related debate claims, 1 recorded curation response and 28 recorded stance responses returned during verification. Counts are observations, not hardcoded fixtures. Counts may change with indexing. Direct sources were returned for several claims about AI use in schools. Watch time, impressions, completed debate counts, and popularity history remain unavailable in this prototype.

## Editorial direction

See EDITORIAL.md. The editor can feature claims and explain their perspective independently of public metrics. No default editorial stance is assumed. The reference evidence atlas is not yet matched to individual live claims; its link is explicitly exploratory rather than evidentiary support.
