# Geo block support: SDK and renderer study

Reviewed September 12, 2026. A complete traversal of the current education catalog found **27 Datasets and 90 Blocks**, all classified as supported text or explicit collections before the image addition. This is scoped evidence for those catalog members, not a census of all Geo or a claim of visual parity with Geo's interface.

## What is supported

- Native Text blocks: scoped Markdown, with raw HTML skipped.
- Data blocks with one explicit Collection data source: ordered Collection item traversal and Companion's own cards, filters and eligible plots.
- Image entities used as blocks, with a scoped Image URL. Supported immutable IPFS references use the existing Pinata gateway. Images load automatically by default; the saved Content images → Only when I choose preference requires Show image before downloading; errors provide retry, and unsupported URLs retain the Geo link. No new endpoint, SDK dependency, publisher write or wallet access was added. This currently applies to dataset blocks, not a full rewrite of the separate curation renderer.

## What remains unsupported or partial

| Kind | Why additional work is needed |
| --- | --- |
| Query / All of Geo sources | Need bounded interpretation of saved filter groups, scopes, selectors and sorting. A source type is not enough to determine equivalent results. |
| Relation-backed views | Geo's renderer resolves a relation-from filter into a distinct source mode; edge direction and relation-entity metadata must be preserved. |
| Saved presentation | View type, shown columns and per-consumer settings can live on the relation to a block. Companion currently provides its own view and does not reproduce table/gallery/list layout or apply every saved filter. |
| Video and other specialized nodes | Require their own validated read, media policy, accessibility and download behavior. |
| Arbitrary image locations / legacy Image block type | Current support follows the web renderer's Image entity type and canonical Image URL. Other representations remain linked until their mapping is verified. |
| New scalar types | Broad result details currently handle text, integer, decimal and boolean fields. Date, time, point and other values need explicit adapters rather than guessed text conversion. |

Recognizing a block type is not the same as implementing every setting on it. In particular, current explicit collections are explored as full member collections, not claimed to be exact replicas of saved Geo table views.

## Sources and implications

The publisher has `@geoprotocol/geo-sdk` **0.20.3** installed. Its `dist/src/ops/data-blocks.js` maps COLLECTION, QUERY and GEO to different source entities; `dist/src/core/ids/system.js` supplies block, image and view identifiers. The SDK constructs operations and provides API/upload workflows; installing it alone does not supply Companion's React renderers.

Primary upstream references:

- [SDK README: blocks and images](https://github.com/geobrowser/geo-sdk/blob/main/README.md#blocks).
- [Geo image renderer](https://github.com/geobrowser/geogenesis/blob/master/apps/web/partials/editor/image-node.tsx): reads Image URL in the selected space and uses Image type.
- [Source interpretation](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/blocks/data/source.ts): collection, space-scoped, graph-wide and relation-derived modes.
- [Data-block reader](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/blocks/data/use-data-block.tsx): combines source, filters, selectors, mapping, sorting and pagination.
- [Filter translation](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/blocks/data/filter-state-to-where.ts): next implementation reference, not yet fully studied or ported.

These upstream branches can change; compare the actual schema and indexed examples before extending the adapter. Do not default an unknown or malformed source to an unrestricted graph query.

## Next support work

1. Inventory saved filter/view properties and relation-entity settings on the current collections.
2. Implement a validated subset of filter operators with fixtures shared against upstream behavior; reject unsupported operators explicitly.
3. Add bounded space/query and relation-source readers with paging, direction and cross-space conflict tests.
4. Add chosen layout capabilities and specialized scalar/media renderers only where useful to the Companion.

No missing publication was established by this block census. Missing operational outreach data remains in the existing publisher queue. Renderer gaps belong to frontend work; do not request duplicate publications as a workaround.

Verification: build and 62 tests pass. Browser read-response interception used a synthetic Image block and image response without modifying Geo: zero image fetches before the click, one after, image decoded, eight STAR results retained. Real published dataset image coverage remains unverified because this catalog currently contains none.
