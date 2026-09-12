# Application boundaries

| Area | Routes | Scope |
| --- | --- | --- |
| Selector | `#/` | Two app entries, live primary-space avatars |
| Preferences | `#/preferences` | Browser settings and selected public profile IDs |
| Education | `#/education/` plus dashboards, curation, debates, map, atlas, questions, live | Feature-scoped Geo reads; atlas/questions use a reference snapshot |
| Outreach | `#/outreach/` plus directory, map, weekly, food, coordination | Basemap implemented; service integration pending |

The shell lazy-loads app modules and unmounts transient state when switching apps. Preferences remain shared. Dataset queries and caches remain separate. All headers use the triangle brand. Legacy education fragments remain supported.

The user selected existing Public good space `f24e3bbd26304474b7e0c2a0877f4bfe` for outreach. Future reads must filter exact directory membership as well as space, and exclude private encampments or undisclosed routes. Destination approval is not proof of published operational data.

See [architecture](ARCHITECTURE.md) for component interactions and [publisher handoff](PUBLISHER_HANDOFF.md) for responsibilities.
