# Deployment

## 0.5.2 — Cache status in Preferences

Feature `496c2b9a` completed 2026-09-16T14:57:47.224015Z; metadata `eeeab845`; source `f206d9b`.
Removed the globally floating cache status button. Preferences now shows progress/results inline beside its cache opener. The home opener remains; the coordinator continues across navigation. Browser verified inline running status in Preferences, no status overlay on Home during the same job, and production Preferences over HTTPS. TypeScript/Vite build and staged diff checks passed. No cache retention or query behavior changed.


## 0.5.1 — Persistent retention and revisit updates

Feature `530128b0` completed 2026-09-16T05:14:54.830882Z; metadata `bb3067f5`; source `21d6e7f`.
Saved records no longer expire or undergo age/capacity eviction. The 30-minute interval is freshness only. Enabled visits start bounded refresh passes, and visible return after 30 minutes refreshes again. Disabling pauses updates without deleting records; explicit Clear remains the deletion operation. At the 16 MiB budget, writes report failure rather than discarding retained entries. Refresh failures preserve prior records.

98 tests and TypeScript/Vite build passed. Browser verified enabled startup begins caching automatically and turning off stops the pass. Production HTTPS shows the new retention and opt-out controls. Browser storage eviction is still outside application control. See docs/GRAPH_CACHE_DESIGN.md.


## 0.5.0 — Larger networks and optional local caching

Feature deployment `a053b619` completed 2026-09-16T05:00:25.634101Z; release metadata deployment `707c4db5`. Source commit `10f039d`.

Verified production HTTPS home page and opt-in cache controls (disabled by default). Local browser verification: bounded pass completed 197 tasks, discovering 5,623 distinct entity IDs with zero task errors; reload reused saved graph pages to render 253 nodes and 200 links. Incoming/outgoing expansion increased that slice to 257 nodes and 205 links. Continue in background leaves the coordinator mounted across app routes. These are observed slices, not space totals. 98 tests, TypeScript/Vite build and staged diff checks passed. No Geo writes.

See [graph and cache design](docs/GRAPH_CACHE_DESIGN.md) for limits, storage/freshness rules, adapter coverage, and remaining work. Cache progress counts tasks; storage is bounded to an estimated 16 MiB and a 30-minute fresh-read window. This release does not promise a complete offline snapshot or work after the tab closes.


## 0.4.8 — Toggle graph detail tables

Deployed September 16, 2026 at 04:09:29 UTC (Cloudflare completion time).
Feature deployment: `68fd488a`; release metadata deployment: `bb9918da`.
Source commit: `6025460`.

View controls now includes **Show entity details**, allowing the table to be hidden or restored while the graph remains open. Neighborhood highlighting stays active. Hiding the table prevents new detail reads; the setting resets when the applet is reopened.

Validation: TypeScript/Vite build passed; browser verification confirmed the table appeared, disappeared, and reappeared without closing the graph. The toggle is present on the production HTTPS site.


## Frontend verification - version 0.4.7

Feature 233a69f7 completed at 2026-09-16T04:00:34.959073Z; metadata b51229a2. Source 5aeda04. Production HTTPS browser verified native fullscreen entry (Exit fullscreen control), successful exit (Fullscreen control), and a live STAR entity table with source, description and supporting/opposing relationships. Fullscreen uses a div inside the dialog; calling requestFullscreen on the dialog was the actual previous defect. All 95 tests, build, formatting and diff checks pass. The table is bounded to 32 scoped values and 20 scoped outgoing relations with truncation disclosure, 300ms hover delay, stale-response guard and shared memory caching. Screenshot: outputs/fullscreen-entity-table.png (local artifact). No Geo writes.


## Frontend verification - version 0.4.6

Initial feature d8de2b23 completed at 2026-09-16T03:29:52.322258Z; metadata f5eade6f. Source 6cf37a5, with proportional corner-radius refinement 9e600e7 deployed as b3077fc4. Verified Health scoped Cover against the live API and all six featured-space images in the production browser. Space icons prefer Avatar, then Cover when Avatar is absent, then the shared triangle. Centered square crops and inset bevels are shared across app cards and space buttons. Icon parser tests and TypeScript/build pass. This supersedes the previous Health Avatar publishing request; no Geo change was needed.


## Frontend verification - version 0.4.5

Feature 92ef5e6b completed at 2026-09-16T03:22:18.989704Z; metadata b214b213. Source a52d6da. Shared app registry requires a starting Geo scope; distinct scoped entity contributions choose the app icon source with deterministic ties and a session-only winner cache. Production links verified for Health/Eric Topol and Education/STAR, including three explicit Load more actions for the screenshot debate. Returning Home after changing People from Health to Education changed its fallback mark to the live Education avatar. All 93 tests, TypeScript/build, formatting and diff checks passed. Captured production screenshots for the Discord walkthrough. No Geo writes. See docs/APP_ICON_POLICY.md for scope and caching limits.


## Frontend verification - version 0.4.4

Feature 94165829 completed at 2026-09-16T03:16:00.252669Z; metadata 918e3791. Source 9306de6. Unnamed graph endpoints resolve by exact Space identity to its public profile page, preserving canonical edge IDs and label provenance. Production HTTPS browser verified AI and World affairs load, Kevin can be selected and Open on Geo targets the verified profile page. All 91 tests, TypeScript/build, formatting and diff checks passed. Read-only evidence and publisher-derived discovery design: [diagnosis](docs/GRAPH_DISCOVERY_DIAGNOSIS.md). No Geo data was changed or proposal submitted.


## Frontend verification - version 0.4.3

Feature 9e31e73e completed at 2026-09-16T03:07:01.814194Z; metadata 99f7e8f9. Source 61e8cf8. Full-window canvas applet adds directed links, motion controls, neighborhood highlighting, scoped Geo avatars and image export. Local Health check rendered 70 entities, 50 relationships and four opted-in images. Mobile dialog measured 390 x 844 with no horizontal overflow; toolbar and drawer remain accessible. Production HTTPS Health graph and applet verified. All 89 tests, TypeScript/build, formatting and diff checks passed. Native fullscreen remains browser-dependent; the viewport applet does not require it. Bounded discovery and cross-space follow-ups are documented in docs/GRAPH_EXPLORERS.md.


## Frontend verification - version 0.4.2

Feature `1ac970b2` completed at `2026-09-16T02:49:37.193751Z`; metadata `cf6b65b5`. Source `3b9b4fa`. Reading preferences now have bordered native radio groups and an accessible force-graph On/Off switch, with help text contained in the relevant setting. Verified locally at 375px with Larger text: no horizontal overflow, all controls update and persist after reload. Production HTTPS browser renders the new controls. TypeScript/build, six targeted preference/theme tests, formatting and diff checks passed. Storage and data behavior unchanged.


## Frontend verification - version 0.4.1

Feature deployment `0be681a2` completed at `2026-09-16T02:36:51.596124Z`; metadata deployment `3906de24`. Source `a55d886`. Graph apps now use the normal full-width header and consistent responsive type sizes, and discover pinned spaces from Root's Featured topic tags. Production browser verified all six live pins and a 1265px header with a 48px heading. Local Health pin selection rendered live authorship; loaded mobile document and scroll widths were both 375px with 32px heading and 16px graph inputs. All 86 tests, build, formatting and diff checks pass. See [featured flag semantics and limits](docs/GRAPH_EXPLORERS.md). No Geo writes or account-level pins were changed.


## Frontend verification - version 0.4.0

Feature deployment `41f103f7` completed at `2026-09-16T02:26:55.603001Z`; metadata deployment `599c40cc`. Source `63ab27b`. Two standalone graph apps now use React Flow by default and a Preferences-enabled force-graph pop-out. Production HTTPS and direct Geo debate rendering verified; local browser verified authorship, STAR opposing-argument focus, preference persistence, force canvas and pause. Mobile dialog measured 374px inside a 375px document without horizontal overflow. Embedded-browser fullscreen was unavailable; the fallback message and expanded dialog worked, so native fullscreen success is not claimed. All 83 tests, TypeScript/build, formatting and diff checks pass. Current scope and follow-ups: [graph explorers](docs/GRAPH_EXPLORERS.md). No Geo writes, VM or Worker deployment.


## Frontend verification - version 0.3.4

Feature `ff539a9a` completed at `2026-09-14T19:56:29.814834Z`; metadata `996e159f`. Source `c88a954`. Popup buttons now have explicit light surfaces, dark teal text and wider labels in both app maps. Local dark-mode screenshot and production popup check passed: computed text rgb(23,75,67), background rgb(237,245,243), width 211px. Production build passed. CSS-only fix; no data or API changes.


## Frontend verification - version 0.3.3

Feature deployment `c393ceab` completed at `2026-09-14T19:52:36.711946Z`; metadata upload `dc79e10c`. Source `10fbdce`. Production HTTPS 200 serves `index-DLkGKej0.js`; the live browser renders shared controls and the Indy pilot. Local browser verified layer toggling, selection and education search from 12 locations to Chicago, with 375px client/scroll widths. All 76 tests, build and formatting pass. Area/category/offline phases remain planned; no Geo, Worker or VM changes.

## Current frontend verification � version 0.3.2

Feature deployment `8933d4a0` completed at `2026-09-14T19:41:48.352672Z`; metadata-only deployment `4f520471` published release history. Source commit `45ad8c7`. Production HTTPS returned 200 with `index-hiHZLvTF.js`, and a production browser rendered the Outreach Near Eastside service from Geo, its official source link and public-stop map. Local search removed/restored the service; the narrow layout measured 375px client and scroll widths, with no horizontal overflow. All 74 tests, formatting and production build pass. Weekly/food filtering remains unavailable pending published verification fields. See [live pilot and publisher queue](docs/OUTREACH_LIVE.md). No Geo write, Worker or VM change occurred.

## Current frontend verification — version 0.3.1

Feature deployment `fca83e06` completed at `2026-09-14T17:17:33.268957Z`; metadata-only deployment `b67e320f` then published the release history. Source commit `b3082e3` and release-record commit `4bb7540` are pushed to `main`. The custom domain loaded the new application successfully. Live browser checks used direct Geo reads: Reading First rendered seven compatible effects and four actual-versus-estimated-counterfactual means; Perry rendered 24 named treatment/control pairs and 24 societal benefit-cost scenarios with their published horizon, discount rate, deadweight-loss and crime-valuation assumptions. At 375px and 1265px rendered widths, the dark-mode Reading First panel had no document-width overflow; accessible tables remained visible, and keyboard navigation reached the result search control. No Geo mutation occurred. Local validation: 70 tests, formatting check, production build and `git diff --check` pass. No Worker, VM or Geo publication changed.

## Current frontend verification — version 0.3.0

Feature deployment `53225cb7-1ee2-44a5-ba87-046b2b65c8e1` completed at `2026-09-14T17:09:30.461253Z`; metadata-only deployment `39772711` then published the release history. Source commit `08ee395` is pushed to `main`. The custom domain returned HTTPS 200 with `index-CtpmRJKY.js`, and `releases.json` lists the version-0.3.0 live-comparison release with the authoritative feature timestamp. Local validation: 69 tests, formatting check, production build and `git diff --check` pass. No Worker, VM or Geo publication changed.

The existing Cloudflare Pages project is `geocompanion`, production branch `main`.

- Public site: https://geocompanion.dpdns.org/
- Pages address: https://geocompanion.pages.dev/
- Source: [GeoCompanion](https://github.com/athsrueas-geocurator/GeoCompanion)
- Current frontend: version `0.2.0`, feature deployment `903e66e4`, source `f7366a3`, asset `index-C-UJev1c.js`. Release-history metadata published as `809f5c87` (September 12, 2026).
- Coordination Worker: `https://geocompanion-coordination.thomasfreestone.workers.dev`, version `305ce72b-16f5-495e-a2eb-15b564513896`; HTTPS health and room creation verified.

Previous `648e6635` frontend verification: HTTPS 200 on the custom domain with `index-DiLjdSRM.js`; hosted research view returns 40 questions, including the six Krueger–Hanushek positions. Economic parent displays two supporting arguments and one opposing argument. Local checks cover 320/390/1280px, dark/light, shared Questions dialog/Escape, live search and cached return navigation. All 43 tests, formatting and build pass. See [dynamic argument contract](docs/DYNAMIC_ARGUMENTS.md). Deployment used the reviewed working tree based on `a985218`, with the implementation committed immediately afterward; no Worker, wallet or VM changes.

## Current frontend verification — version 0.2.0

Feature deployment `903e66e4` completed at `2026-09-12T15:23:06.294309Z`, as reported by Cloudflare. Metadata-only deployment `809f5c87` published that exact time in the release history. An intermediate upload `34d9ceb6` contained the same feature assets before the metadata was recorded; it is not a separate feature release.

Custom-domain HTTPS returned 200 with `index-C-UJev1c.js`. Production About displays version 0.2.0; Recent changes displays seven entries and the correct ISO deployment timestamp. An older browser read marker produced a dot on About, opening Recent changes cleared it, and reload preserved that state. Mobile dark mode had no document overflow. Build, formatting and all 65 tests passed. No Worker, publisher or VM deployment was involved. Follow [the release-recording workflow](docs/RELEASES.md) for future feature versions.

## Previous frontend verification — `17c8ed73`

Deployed source `d4f77b9` through the dist-only script. Custom-domain HTTPS returned 200 with `index-CwxKWLOa.js`. Production Preferences displayed automatic images by default; switching to ask mode survived reload, and the original setting was restored after the check. The 390px dark layout had no document overflow or in-app alerts. Existing CSP-blocked Cloudflare beacon console entries remain unrelated to the change.

Local build, formatting and 63 tests passed. A synthetic browser Image-block response verified automatic downloading and, after saving ask mode and reloading, zero image requests before clicking and one afterward. No synthetic content was written to Geo. This includes the previous image renderer; no Worker, publisher or VM changes.

## Previous frontend verification — `7889e066`

Deployed source `ef778c4` through the existing dist-only script. Production custom-domain HTTPS returned 200 and the expected `index-DUCQLzRM.js` asset. Browser checks returned 27 datasets, eight STAR records with no in-app alerts, and 21 native Questions. 390px light and 1280px dark dashboard checks found no document overflow. Geo reads remain direct to `api-testnet.geobrowser.io`; no VM request path was observed. The existing Cloudflare-injected analytics beacon remains blocked by CSP and produces a console entry; the application reads succeeded.

Local build, formatting and 62 tests passed. Intercepted read responses (no Geo writes) verified unsupported collection-source changes, missing linked dataset visibility and recovery after refresh. Block metadata no longer includes collection members; unsupported blocks retain links rather than being misidentified as empty tables. All earlier pushed collection/reference/filter changes are included in this frontend release. No Worker, VM or publisher deployment was performed.

## Earlier coordination release (`0ce92d86`)

Two hosted browsers joined one room, sent and opened the Chicago map selection, then sent and opened the selected curated post. Mobile controls fit at 375px without horizontal overflow. The custom domain returned HTTPS 200 with `index-DxXxnyCW.js` and the coordination CSP. Telemetry was left off during production checks; `/insights` returned an empty list. Local runtime integration tests exercised actual D1 writes and aggregates instead.

Source for that release was committed after deployment as `d9a04d6`. Its GitHub push failed because Git credentials were unavailable; deployment succeeded independently. The preceding experiment-notes commit `6da8091` was also local-only at that check. These are observations from September 12, not proof of the remote's future state. Follow the [future-commit checklist](docs/DEVELOPMENT.md#checklist-for-future-commits) when recording subsequent releases.

## Procedure

```sh
npm ci
npm test
npm run format:check
npm run build
npm run deploy
```

Build type-checks and creates `dist/`. The deployment script reads only the Cloudflare token and account ID from local `.env` and uploads only `dist/`. Vite does not load `.env`. Public browsing needs no credentials.

The script checks output for symlinks, unexpected hidden/runtime files and recognized credential material. It redacts the deployment token from buffered output. This guard supplements review; it is not a universal secret detector. Never upload the repository root.

After deployment, verify production HTTPS, the current asset in index.html, relevant routes and browser network destinations. External provider changes require reviewing `public/_headers`. Git pushes do not themselves prove deployment; this repository uses a manual deployment script.

Rollback through a previously verified Cloudflare deployment, or rebuild and redeploy a known-good source commit. A source revert alone does not roll back hosting.

## Infrastructure boundaries

September 12: [budgeted Reticulum neighbor transport](docs/NEIGHBOR_NODE.md) enabled on linux-cloud, with a dedicated UID, 50 MB monthly reservation ceiling and daily kernel quotas. It is separate from frontend delivery and the maintenance messenger. No Pages or Worker deployment accompanied that change.

Optional sessions and opt-in aggregate counts run on Cloudflare Workers, SQLite-backed Durable Objects and D1. Deploy with `npm run deploy:coordination`, then rebuild and deploy Pages. See [protocol, permissions, limits and local integration tests](docs/COORDINATION.md). The deployment script never changes the account subscription. The token could not read billing subscriptions; no account-level zero-cost guarantee is claimed.

No VM app endpoint is involved. The proposed linux-cloud collector remains unimplemented. Caddy permissions on psi-ai-agent apply only to that separate host. Free-tier eligibility requires current provider and billing checks; budget alerts are not spending caps.

[Historical observations](docs/DEPLOYMENT_HISTORY.md) are retained for traceability, not current instructions.

## Open Data Discovery experiment

September 12, 2026: a separate 120-second experiment in the local sibling
`Open_Data/experiments/discovery-smoke/` exercised Linux-to-Cloudflare compressed
metadata uploads and compact queries. It used uniquely named temporary Workers/D1
resources, not the production coordination service. See that experiment's
`last-result.json` for measurements and cleanup status. No discovery UI or ongoing
VM service was deployed; Geo reconciliation and publication receipts remain planned.

## September 12: live atlas deployment

Pages deployment `915cfab3.geocompanion.pages.dev` serves production asset `index-CQidbkU-.js`. Production HTTPS atlas returned 34 live initiatives with a successful direct browser POST to Geo; the studies selector returned 8 in preview. Desktop search and linked CUNY findings passed; 390px mobile viewport had no document overflow. Build and all 33 tests passed.

`education.json` is absent from dist and new deployment routes return the SPA HTML rather than that dataset. The old custom-domain URL briefly retained its previous five-minute CDN cache; an exact-URL purge was unavailable to the current token (401). Current app chunks do not request it. No cache-purge permission expansion was requested. The existing Cloudflare-injected analytics beacon remains blocked by the site CSP; it does not block Geo reads.

## September 12: system appearance and mobile improvements

Pages deployment `cf232475.geocompanion.pages.dev` serves production asset `index-CVlH90sS.js`. Production HTTPS verified at 390px: dark atlas with 34 live entries, mobile navigation to the STAR dashboard, and an in-place switch to light colors; neither view overflowed the document. Geo POSTs succeeded. Build and 35 tests passed. See [appearance implementation and checks](docs/APPEARANCE_ACCESSIBILITY.md). No backend or credentials changes.
