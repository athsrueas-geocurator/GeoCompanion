# Geo Companion

A lightweight, read-only companion to Geo, with separate education and Indianapolis outreach apps.

[Open the app](https://geocompanion.dpdns.org/) · [System architecture](ARCHITECTURE.md) · [Development guide](docs/DEVELOPMENT.md) · [Deployment](DEPLOYMENT.md) · [Remaining work](TODO.md)

## What works today

| Area | Implemented behavior | Current limit |
| --- | --- | --- |
| App selector | Compact cards, shared triangle brand, live primary-space avatar lookup | Missing avatars use the triangle |
| Education dashboard | Live STAR estimates, filters and uncertainty plot | One study; not a comprehensive program ranking |
| Curation | Published profile posts, ordered Markdown and linked books | Reads supported Geo fields; no frontend publishing |
| Debates | Education-related claims and public response counts | Counts are not views, representative opinion or proof |
| Connections | Shared sources, places and reading links; dynamic space filters | Rooted in education datasets and the editor profile, not all Geo |
| Education map | Live location links, verified coordinate lookup and browser cache | Records without coordinates remain in the list |
| Evidence atlas / questions | Searchable Education-Initiatives reference snapshot | These views are not live Geo data |
| Indianapolis outreach | Separate navigation and an Indianapolis basemap | Verified service directory, schedules and map pins are not connected yet |
| Preferences | Local reading settings and public-profile search/follows | Following is not authentication or ownership verification |

## Run locally

Use Node.js 22.12+ and npm. Install the pinned dependency graph:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Public browsing needs no credentials. `npm run build` type-checks and builds `dist/`; `npm test` runs adapter tests; `npm run format:check` checks source formatting. See the [development workflow](docs/DEVELOPMENT.md).

## Code layout

```text
src/main.tsx               React bootstrap
src/app/                   Router, app selector, error boundary, global styles
src/apps/education/        Dashboards, curation, debates, connections, map and adapters
src/apps/outreach/         Outreach shell and basemap
src/shared/branding/       Triangle brand and runtime space avatars
src/shared/preferences/    Browser preferences, profile search and follows
src/config/                Public endpoint and reference provenance
public/                    Static assets, security headers, reference dataset
scripts/                   Deployment and retired-import guard
tests/                    Pure data-contract and adapter tests
docs/                     Contributor workflow and documentation index
```

## Related projects

- [geo_publisher](https://github.com/athsrueas-geocurator/geo_publisher): research, ontology mapping, authorized Geo writes and publication verification. This app consumes its published data; it does not import or run publisher code.
- [Education-Initiatives](https://github.com/athsrueas-geocurator/Education-Initiatives): original education migration/reference dataset. Snapshot commit is recorded in `src/config/public-config.ts`.
- [Geo SDK](https://github.com/geobrowser/geo-sdk): upstream publishing integration.
- [Geo web application](https://github.com/geobrowser/geogenesis): upstream ontology and response semantics references.

Cloudflare serves the frontend. Browsers read Geo and image/map providers directly. **The Google Cloud VM is not in the current application request path.** Its proposed background collector remains design work, described in [LOW_EGRESS_PROTOCOL.md](LOW_EGRESS_PROTOCOL.md).

Canonical editorial writing belongs on the user's Geo profile. Local drafts, wallet keys and deployment tokens are never application source or build inputs. The root `.env` is ignored and Vite does not load it. See [editorial rules](EDITORIAL.md) and the [documentation index](docs/README.md).
