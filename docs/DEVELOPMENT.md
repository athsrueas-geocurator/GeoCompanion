# Development and change process

## Local setup

1. Clone [GeoCompanion](https://github.com/athsrueas-geocurator/GeoCompanion) and install Node.js 22.12+.
2. Run `npm ci`, then `npm run dev`. No publisher checkout, VM or credentials are required to browse public data.
3. For deployment only, copy `.env.example` to `.env` and fill the Cloudflare token/account fields locally. Do not place secrets in `src/config`, Vite variables or `public/`.

## Where a change belongs

- `src/app`: app selection, hash routes, shared page shell and global CSS.
- `src/shared`: branding, preferences and coordination controls reused by multiple apps.
- `src/apps/education`: education-specific components, styles and pure query/normalization modules.
- `src/apps/outreach`: independent outreach UI. Dataset integration is pending.
- `src/config`: public endpoint and snapshot provenance. Feature ontology constants remain in their adapter.
- `tests`: Node test runner tests, importing pure `.mjs` adapters without mounting React.
- `scripts`: operator tooling executed outside the browser.
- `services/coordination`: Cloudflare Worker, Durable Object rooms, D1 schema and deployment configuration. See [coordination](COORDINATION.md) before changing its protocol or limits.

Keep feature styles beside their components. Keep the bootstrap small. Avoid Windows case-insensitive filename collisions between component and adapter names. Do not move editor text into the interface source.

## Changing or adding a feature

1. Read AGENTS.md, the architecture, TODO and the relevant feature contract.
2. Inspect the actual public Geo schema and example responses. Coordinate dataset membership, property IDs and missing-value semantics with the publisher before adding queries.
3. Keep read queries scoped and bounded. Include cursor handling, cancellation, sensible caching and malformed/error/empty states. Do not blindly reuse another dataset's cache keys or filters.
4. Add UI that provides a useful comparison or task, keeping scientific context and source links where needed. Preserve canonical user writing.
5. Add meaningful adapter tests for the new behavior. Run `npm test`, `npm run build`, and `npm run format:check`; use `npm run format` to apply the shared formatting convention.
6. Check the rendered desktop and mobile UI, interactions and browser network destinations. Tests/build alone do not verify visual layout, upstream availability or deployment.
7. Update the contract and TODO with evidence. Commit source and documentation together. Deploy only the verified `dist/`, then verify HTTPS and the current build at the live URL.

## Related-repository workflow

The publisher is a sibling project locally for this workspace, but is not a runtime dependency. Use [geo_publisher](https://github.com/athsrueas-geocurator/geo_publisher) for publication work and its reviewed contracts. The app consumes public Geo API output, not publisher credentials or private staging files. [Education-Initiatives](https://github.com/athsrueas-geocurator/Education-Initiatives) remains the reference/migration source.

A publisher handoff should specify: target space and dataset membership; reused types/properties; source and verification rules; expected sample query/response; privacy restrictions; update behavior; unresolved questions. Publication approval remains with the publisher's established workflow. A frontend code request does not authorize rewriting the user's editorial content.

## Source-control boundaries

Commit source, tests, lockfile, public assets and reviewed documentation. Exclude `.env` variants, dependencies, build output, scratch API captures, billing notes and unpublished editorial drafts. Existing local drafts are preserved. The MIT license from the remote repository is retained.

GitHub source updates and Cloudflare deployment are separate steps. This repository currently uses a manual `npm run deploy`; no automatic GitHub deployment pipeline is assumed.

## Checklist for future commits

1. Review `git status` and the relevant diff. Keep unrelated work and local drafts out of the commit. Include corresponding tests, lockfile changes and documentation when the behavior requires them.
2. Update the relevant feature contract when fields, queries, selection messages, caching, consent, retention or limits change. Update ARCHITECTURE.md when responsibilities or network destinations change. Keep unfinished acceptance checks in TODO.md.
3. For application changes, run `npm test`, `npm run build` and `npm run format:check`, then check the affected desktop/mobile interactions. For coordination changes, also run the local Worker/D1 integration checks described in [COORDINATION.md](COORDINATION.md). Never seed production usage counts to test analytics. Documentation-only changes need consistency and link checks, not a new application deployment.
4. Inspect the staged diff with `git diff --cached` and `git diff --cached --check`. Confirm that credentials, `.env`, unpublished writing, `dist/`, `.wrangler/` and scratch captures are excluded. Do not paste secret values into a commit message or verification record.
5. Use a commit message that states the resulting behavior. Record meaningful validation and remaining limitations in the body when useful. Commit implementation and its documentation together.
6. If deployment is part of the task, record the actual Pages release ID, Worker version when changed, source commit or explicitly described uncommitted state, verification date, live URL and checks in DEPLOYMENT.md. Move superseded observations to its linked history when needed. Preserve protocol compatibility across separate frontend/backend releases; a Pages rollback does not undo D1 migrations or roll back the Worker.
7. Record GitHub push status separately from deployment status. If authentication fails, retain the local commits and say which work is not on the remote. Do not claim a successful deployment means source was pushed, repeatedly open credential prompts, or put credentials in the remote URL. Once authentication is restored, inspect remote changes before pushing; do not force-push over them.

A useful verification note is:

```text
Change: <what changed and why>
Validation: <checks actually run and observed results>
Deployment: <not deployed, or Pages release / Worker version and HTTPS checks>
Source: <commit or precise description of uncommitted deployment state>
Remote: <pushed commit, or local-only and reason>
Remaining: <unmet acceptance checks or operational follow-up>
```

Keep these records factual. Do not check off elapsed-time retention, room expiry, provider billing or load behavior based only on a successful build or a brief interaction test.
