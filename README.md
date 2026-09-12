# Geo Companion

A lightweight, read-only companion to Geo, with separate education and Indianapolis outreach apps.

## Why I built it this way

I wanted to see how much I could build without creating another monthly bill. Free was the goal, but so were efficiency and accessibility. It should work in an ordinary browser, including on a phone, without someone needing a wallet or an account just to explore. I wanted to be thoughtful about what gets downloaded, what can be cached, and whether a server needs to be involved at all. Having access to a Linux box doesn't mean every request should pass through it.

I also wanted to make something useful alongside Geo while keeping Geo at the center. The data, relationships, and my published writing belong there, where other people can explore them and build something else with them. This app should help people do things with that information: compare educational findings, follow a connection between a book and an idea, or eventually find out where someone can get help in Indianapolis. I want new information published on Geo to become useful here without having to rewrite the app every time.

As a teacher, I spent a lot of time putting numbers on students when I would rather have been learning with them. That experience matters to how I think about this project. A dashboard needs to help us ask a better question or make a useful decision. Displaying more numbers isn't the goal. I'm interested in real levers for improving education when resources are scarce, and in helping outreach organizations coordinate around what people actually need.

This is also an experiment in what an agent can help one person orchestrate. There is research, data organization, publishing, interface design, hosting, and all the work of getting those pieces to agree with one another. I wanted to see how far I could take an idea by working through those connections with an agent. My role is still to decide what matters, question the results, and write and curate my own thoughts. The technology should give me more room to do that thoughtfully.

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
| Evidence atlas / questions | Paginated live programs, studies and policy claims, with linked findings | Original assessment matrix and 21-question coverage require publisher reconciliation; see [field handoff](docs/PUBLISHER_DATA_GAPS.md) |
| Indianapolis outreach | Separate navigation and an Indianapolis basemap | Verified service directory, schedules and map pins are not connected yet |
| Preferences | Local reading settings and public-profile search/follows | Following is not authentication or ownership verification |

The interface follows your system light/dark setting and adapts navigation and controls for phones. See [appearance and accessibility](docs/APPEARANCE_ACCESSIBILITY.md).

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
public/                    Static assets, security headers, public service config
scripts/                   Deployment and retired-import guard
tests/                    Pure data-contract and adapter tests
docs/                     Contributor workflow and documentation index
```

## Related projects

- [geo_publisher](https://github.com/athsrueas-geocurator/geo_publisher): research, ontology mapping, authorized Geo writes and publication verification. This app consumes its published data; it does not import or run publisher code.
- [Education-Initiatives](https://github.com/athsrueas-geocurator/Education-Initiatives): original education migration/reference dataset. Snapshot commit is recorded in `src/config/public-config.ts`.
- [Geo SDK](https://github.com/geobrowser/geo-sdk): upstream publishing integration.
- [Geo web application](https://github.com/geobrowser/geogenesis): upstream ontology and response semantics references.

Cloudflare serves the frontend and a small optional [shared-exploration and usage-count service](docs/COORDINATION.md). Browsers read Geo and image/map providers directly. **The Google Cloud VM is not in the application request path.** The older collector proposal remains deferred. Research now distinguishes [browser-based Linux experiences](docs/LINUX_BROWSER_RESEARCH.md) from [experiments that benefit from a real Linux host](docs/LINUX_HOST_RESEARCH.md), especially network testing and disconnected messaging.

Canonical editorial writing belongs on the user's Geo profile. Local drafts, wallet keys and deployment tokens are never application source or build inputs. The root `.env` is ignored and Vite does not load it. See [editorial rules](EDITORIAL.md) and the [documentation index](docs/README.md).
