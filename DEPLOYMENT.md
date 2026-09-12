# Deployment

The existing Cloudflare Pages project is `geocompanion`, production branch `main`.

- Public site: https://geocompanion.dpdns.org/
- Pages address: https://geocompanion.pages.dev/
- Source: [GeoCompanion](https://github.com/athsrueas-geocurator/GeoCompanion)
- Last verified release before repository reorganization: `9e7b227f`, HTTPS 200 and outreach basemap checked.

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

No VM app endpoint is involved. The proposed linux-cloud collector remains unimplemented. Caddy permissions on psi-ai-agent apply only to that separate host. Free-tier eligibility requires current provider and billing checks; budget alerts are not spending caps.

[Historical observations](docs/DEPLOYMENT_HISTORY.md) are retained for traceability, not current instructions.
