# Deployment

The existing Cloudflare Pages project is `geocompanion`, production branch `main`.

- Public site: https://geocompanion.dpdns.org/
- Pages address: https://geocompanion.pages.dev/
- Source: [GeoCompanion](https://github.com/athsrueas-geocurator/GeoCompanion)
- Current frontend release: `0ce92d86` (September 12, 2026), including shared-exploration controls.
- Coordination Worker: `https://geocompanion-coordination.thomasfreestone.workers.dev`, version `305ce72b-16f5-495e-a2eb-15b564513896`; HTTPS health and room creation verified.

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
