# Development and change process

## Local setup

1. Clone [GeoCompanion](https://github.com/athsrueas-geocurator/GeoCompanion) and install Node.js 22.12+.
2. Run `npm ci`, then `npm run dev`. No publisher checkout, VM or credentials are required to browse public data.
3. For deployment only, copy `.env.example` to `.env` and fill the Cloudflare token/account fields locally. Do not place secrets in `src/config`, Vite variables or `public/`.

## Where a change belongs

- `src/app`: app selection, hash routes, shared page shell and global CSS.
- `src/shared`: branding and preferences reused by multiple apps.
- `src/apps/education`: education-specific components, styles and pure query/normalization modules.
- `src/apps/outreach`: independent outreach UI. Dataset integration is pending.
- `src/config`: public endpoint and snapshot provenance. Feature ontology constants remain in their adapter.
- `tests`: Node test runner tests, importing pure `.mjs` adapters without mounting React.
- `scripts`: operator tooling executed outside the browser.

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
