# Editorial authorship and reading

September 12 local update (not yet deployed): initial post selection is now neutral or the reader's saved ID (`geocompanion.selected-post`), not a bundled featured-post ID. Reference links use returned target memberships and the shared resolver, removing the Books/profile destination assumption. Live browser checks verified the Zen reference and saved selection after reload. Older initial-selection details below describe the previous release; an editor-owned featured collection is still pending explicit user selection.

The user personally writes, selects and orders their curation. Interview answers are drafts until the user selects exact publication text. Assistant-written summaries, third-person framing and isolated chat quotations are not substitutes for the user's writing. Earlier assistant-authored book notes were rejected and are not publication input.

## Implemented reader

[Curation.tsx](src/apps/education/Curation.tsx) discovers Post entities in profile space `d00460c203779d21d96fcfc6102d7a72`. The initial selected post is `fd024e4f126343af98c61c32ae6f917e`. [curation-live.mjs](src/apps/education/curation-live.mjs) reads the selected post's profile-scoped text and ordered Blocks, then resolves references, including names from Books space `0477636ace64280fc43a9f440a502291`.

Post discovery uses pages of 20; post reads are bounded to 100 relations and reject truncated required content. Block positions sort case-sensitively and lexicographically. React Markdown skips raw HTML, restricts external links and presents content images as links. Unsupported content is not silently replaced with assistant copy.

Reads use a five-minute memory cache; manual refresh bypasses it. New posts and changed blocks matching this contract do not need a new build. The browser renders canonical Geo text. Cloudflare does not carry a bundled editorial fallback.

## Drafts and publishing

DebateBoard retains a separate local reading-list draft/export tool. Drafts are browser-local and never automatically published. Following a profile is a local preference, not a login or authority to edit it. The selected followed identity does not replace the site editor's collection.

The former static editorial import is retired; `scripts/import-editorial.mjs` fails intentionally. Local unpublished draft documents remain outside source control. Detailed book entities belong in the Books space; the editor's reflections belong on their profile and reference those entities when appropriate.

Publication is handled by [geo_publisher](https://github.com/athsrueas-geocurator/geo_publisher) under the user's authorization. Do not send wallet credentials with handoffs. See [architecture](ARCHITECTURE.md) for how published content reaches the frontend.
