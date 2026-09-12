# About, release history and new-feature notices

Preferences contains Settings & follows, About and Recent changes at `#/preferences`, `#/preferences/about` and `#/preferences/changes`. About displays the package version. Release notes are application metadata on Cloudflare, not canonical education data or personal editorial writing.

`public/releases.json` holds version, deployment ID, successful deployment completion time, title and concise feature bullets. Historical entries use the actual package version at the time (0.1.0) plus distinct deployment IDs. Version 0.2.0 introduces these pages. The timestamp comes from Cloudflare Pages `latest_stage.ended_on` after a successful production deploy, never a commit timestamp or estimated build time. Dates display in the reader's local timezone; the time element retains the exact ISO timestamp.

The small same-origin file is read on startup and revalidated on stale visible-tab return, with no interval polling. It has a 60-second HTTP cache policy, conditional revalidation and a 15-second request timeout. Invalid or failed history reads produce an error only on the Recent changes page; they do not invent a new-feature notice.

`geocompanion.releases.seen.v1` stores the last viewed release timestamp locally. The first visit establishes a baseline without a dot. Later releases show an accessible dot on Preferences links and the Recent changes tab until that page is opened. Opening About or Settings does not clear it. Read state synchronizes across same-origin tabs; no identity, tracking service or server-side read receipt is used. Older rollbacks do not appear newer than the saved timestamp. Storage failure limits this behavior to the current tab.

## Publishing future release notes

1. Increment `package.json` and the root version in `package-lock.json` for a new feature release. Edit `release-notes.json` with its title and short user-facing changes.
2. Run the required tests, formatting, build and browser checks. Commit the feature source, then run `npm run deploy`.
3. After production succeeds, run `npm run record:release -- DEPLOYMENT_ID`. The command reads only deployment credentials, finds that production release, verifies success, and writes its authoritative completion time to `public/releases.json`. It rejects recording a second deployment under an already-recorded version.
4. Run `npm run build` and `npm run deploy` to publish the updated metadata. This second upload records the first time the features became available, rather than changing their date to the metadata update. Do not record this metadata-only upload as another feature release.
5. Verify the live release notes, build asset and HTTPS. Record both the feature deployment and metadata upload in DEPLOYMENT.md, and commit/push the updated history and docs.

The two-step publication is intentional: a static build cannot know its future deployment completion timestamp. It avoids exposing a Cloudflare API token to the browser or adding a backend merely to serve release notes. Keep at most 100 entries in the current history; archive older notes before exceeding that bound.

Verification: release ordering, malformed histories, first-visit behavior and rollback comparisons are covered by tests. Browser checks confirmed a dot for an older saved visit, retention on About, clearing on Recent changes, reload persistence and no overflow at 390px in dark mode. Future release commands must use real Cloudflare IDs and reviewed feature notes; successful source pushes alone are not deployed releases.
