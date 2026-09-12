# Deployment

The existing Cloudflare Pages project is `geocompanion`, production branch `main`.

- Public site: https://geocompanion.dpdns.org/
- Pages address: https://geocompanion.pages.dev/
- Source: [GeoCompanion](https://github.com/athsrueas-geocurator/GeoCompanion)
- Current frontend release: `17c8ed73` (September 12, 2026), source `d4f77b9`, asset `index-CwxKWLOa.js`; includes image support and the saved bandwidth preference.
- Coordination Worker: `https://geocompanion-coordination.thomasfreestone.workers.dev`, version `305ce72b-16f5-495e-a2eb-15b564513896`; HTTPS health and room creation verified.

Previous `648e6635` frontend verification: HTTPS 200 on the custom domain with `index-DiLjdSRM.js`; hosted research view returns 40 questions, including the six Krueger–Hanushek positions. Economic parent displays two supporting arguments and one opposing argument. Local checks cover 320/390/1280px, dark/light, shared Questions dialog/Escape, live search and cached return navigation. All 43 tests, formatting and build pass. See [dynamic argument contract](docs/DYNAMIC_ARGUMENTS.md). Deployment used the reviewed working tree based on `a985218`, with the implementation committed immediately afterward; no Worker, wallet or VM changes.

## Current frontend verification — `17c8ed73`

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
