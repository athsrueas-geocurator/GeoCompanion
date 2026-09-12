# Browser preferences and public profile follows

Implemented September 11, 2026. `#/preferences` is shared across apps and linked from every app header. Public browsing requires no account. Following does not authenticate the visitor, confer permissions, post to Geo, or imply identity ownership.

The user requested live search rather than a predefined identity list. Search starts after two characters and 500 ms without changes. Each new name sends a narrower server-side `includesInsensitive` filter on Space-type page entities (`362c1dbddc6444bba3c4652f38a642d7`), first eight candidates. A second bounded query reconciles their space IDs against PERSONAL spaces and exact page IDs. This avoids treating arbitrary mentions or community pages as people. Excess matches ask the user to narrow the query. Full 32-hex personal-space IDs and Geo profile URLs use direct lookup; incomplete hex IDs prompt completion because UUID filters do not support prefix matching. No fuzzy identity match is silently selected.

Verified live: Thomas returned two profiles; Thomas Freestone narrowed to the user's personal space. GraphQL Space type and name filtering verified against current endpoint. Personal spaces have null representative topic IDs, so topic-name filters alone cannot search users. API search/discovery code in `src/shared/preferences/profile-search.mjs`; no wallet credentials needed.

Persisted key: `geocompanion.preferences.v1`. Payload: version, textSize (standard/large), imageLoading (automatic/ask), profiles (array of selected personal-space IDs, max 25), defaultProfileId (or null). No names, labels, search terms, authentication tokens or profile content are stored persistently. Defaults contain no identities. The existing hard-coded site-editor profile link is editorial provenance, not a follow or user directory.

Saved names are resolved only when Preferences or Curation renders the followed profiles, not at root or outreach startup. Identical successful query/variable combinations are cached in memory for five minutes, capped at 50 entries. Reload clears the response cache but preserves selected IDs. Public profile data remains canonical on Geo. Search changes abort pending fetches and suppress stale responses; requests time out after 15 seconds. No polling, notifications or service worker is added. GraphQL errors/HTTP errors are distinct from empty results; a missing/deleted profile keeps its stored ID with an unavailable state.

Reading text-size preference applies across apps. Default profile is labeled in Curation; it does not replace the site's editor or load unpublished editorial content. Users can remove a follow or clear this feature's preferences. No other keys (including education drafts) are deleted. Storage errors fall back to in-tab state with a warning. Same-origin tabs synchronize via storage events; settings do not sync across origins (custom domain vs pages.dev), browsers or devices.

Validation: production build and 17 tests pass, including ID-only round-trip, duplicate/default removal, malformed/unavailable storage, unsafe URLs, server filtering, profile reconciliation, cache reuse and upstream errors. Browser tested live name search/narrowing, follow, reload persistence, Curation display and removal. No Geo write, user authentication or VM traffic is part of this feature.

## Content-image bandwidth preference — September 12, 2026

Content images default to automatic download. Selecting **Only when I choose** in Reading preferences stores `imageLoading: "ask"`; supported dataset Image blocks then render a Show image button without creating an image request. The setting is local to this browser origin and synchronizes between its tabs through the existing preferences provider. Existing v1 preferences without the field migrate to automatic without losing text size or follows. Clearing preferences restores automatic loading.

Changing policy or a block image URL resets that block's per-image state. The setting cannot undo bytes already downloaded. It controls supported dataset content images; map tiles and small app avatars retain their own behavior, and existing Markdown image links remain links. No telemetry or Geo write is associated with this preference.

Verification: 63 tests/build pass, including legacy preference migration and opt-in persistence. Browser response fixtures confirmed one automatic image fetch, saved ask mode after reload, zero manual-mode requests before clicking and one after. No test content was published to Geo.
