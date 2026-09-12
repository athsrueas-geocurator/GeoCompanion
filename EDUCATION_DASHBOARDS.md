## Chart rendering correction — September 11, 2026

Removed nonuniform SVG scaling: ResizeObserver now matches the SVG viewBox width to the rendered plot width while preserving 64px row spacing. Circles and diamonds retain their geometry; labels align with rows, and axis units are explicit. Small class precedes regular class + aide within each grade, matching the legend. Mobile keeps a 105px label column and fits the plot into the remaining width, superseding the older label-hiding and minimum-width rules.

Browser verification: desktop and 390px mobile markers measured 12×12px; mobile page/viewport widths both 375px, chart 305px. Grade 1 filtering retained both labeled estimates. Numerical values and uncertainty formulas are unchanged. Build passes.

# Education dashboards and curation — September 11, 2026

## Current product slice

Education dashboards is the default view (`#dashboards`). Curation (`#curation`) presents Thomas's supplied resource-constrained education question, a path into evidence and debates, and preliminary notes on four requested books. Existing atlas, questions, debate editing, and live explorer remain available.

The STAR chart and table read the public Geo testnet directly in the browser. The query and typed-property mapping are in `src/apps/education/education-live.mjs`, derived from the publisher's verified STAR contract. All scalar values and relations are scoped to Education datasets `dac259bad48a11adf97fe36857d85206`; resolved display names may reflect other spaces. Grade and arm filtering uses mapped relation IDs, not names parsed out of prose.

The chart uses percentile points, common regular-class comparator, and published standard errors. Approximate intervals are calculated as effect ± 1.96 × SE, not represented as source-reported intervals. Missing numbers remain unknown, incompatible or insufficient records remain in the table but outside the chart, and partial connections fail visibly. No cross-program efficiency ranking or matched observed cost series is implemented. Eight estimates are one study; cohort sample sizes must not be summed.

Study context and canonical property/grade/arm identifiers are maintained source configuration. Numeric values, follow-up, estimand, sample size and source locators refresh from Geo without rebuilding. Unknown ontology mappings need a deliberate adapter update.

## Traffic and failure behavior

One bounded POST (20 estimates, 30 values and 30 relations each), 25-second timeout, no automatic polling, 60-second in-memory cache, and a ten-second refresh cooldown. Returned pagination flags prevent incomplete records being silently used. Previously loaded data remains labeled when refresh fails. More-than-preview-limit data requires opening the complete Geo dataset; this is a deliberate bounded slice, not complete general pagination.

The reference atlas JSON is loaded only when the atlas or questions view is opened. No application endpoint or content path uses linux-cloud. Root `.env` stays excluded from the frontend. Study-source and book-source links open only after a visitor chooses them.

## Verification

- Production TypeScript/Vite build passed; 10 tests passed.
- Fresh live response: HTTP 200, CORS `*`, 16,638 response-text bytes. All eight entity IDs, effects, SEs, Ns and plotting eligibility matched `geo-publisher/data/education/star-experimental-extraction.json` and its registry.
- Browser rendered actual data, grade 1 returned two rows, and grade 1 + small class returned the one 6.79-point estimate (SE 1.1, N 6,452).
- Desktop chart/curation inspected. At a 390-pixel viewport override, dashboard and curation document width matched client width (375 CSS pixels after scrollbar), with no page overflow. Tables and mobile navigation scroll inside their own containers.
- Browser rendering confirms public Geo reads work. Read-only browser timing inspection was unavailable; no fresh network trace is claimed. The new adapter's only request destination is the existing Geo endpoint, and deployment CSP allows that endpoint, not a VM.

## Remaining bounty scope

The publisher's `docs/education-bounty.md` and `docs/education-dashboard-data-contract.md` remain the acceptance sources. This release does not complete the bounty. Pending: additional study adapters, structured cross-program location/population/model filters, matched cost/outcome observations, justified compatible comparisons, and complete source reconciliation. Perry, Saga and Reading First can be reached through the published dataset space but do not yet have companion visualizations.

## Editorial publication

`BOOK_CURATION.md` contains the supplied framing and five preliminary attributed claims across Technopoly, Zen and the Art of Motorcycle Maintenance, The Knowledge Gap, and How Children Fail. These are description-based notes with explicit source limits, not full book extractions. The existing publisher task accepted the preliminary personal-profile publication request. Full breakdowns remain a Books-space task. Geo profile publication and direct frontend integration are pending verified IDs/query details; static companion notes do not prove Geo publication.
