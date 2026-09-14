# Application boundaries

> September 12 update: atlas/questions now read scoped Geo collections through `atlas-live.mjs`, with no shipped education JSON. Older snapshot/matrix descriptions below are historical where they conflict. Full original coverage is pending [publisher field reconciliation](docs/PUBLISHER_DATA_GAPS.md).

| Area | Routes | Scope |
| --- | --- | --- |
| Selector | `#/` | Two app entries, live primary-space avatars |
| Preferences | `#/preferences` | Browser settings and selected public profile IDs |
| Education | `#/education/` plus dashboards, curation, debates, map, atlas, questions, live | Feature-scoped Geo reads; atlas/questions use a reference snapshot |
| Outreach | `#/outreach/` plus directory, map, weekly, food, coordination | Live pilot directory and public-stop map; verified schedule/food views pending |

The shell lazy-loads app modules and unmounts transient state when switching apps. Preferences remain shared. Dataset queries and caches remain separate. All headers use the triangle brand. Legacy education fragments remain supported.

The user selected existing Public good space `f24e3bbd26304474b7e0c2a0877f4bfe` for outreach. Reads filter exact directory membership as well as space, and exclude private encampments or undisclosed routes. Destination approval is not proof of published operational data.

See [architecture](ARCHITECTURE.md) for component interactions and [publisher handoff](PUBLISHER_HANDOFF.md) for responsibilities.
