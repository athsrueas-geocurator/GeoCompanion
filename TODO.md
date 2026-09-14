- [x] September 12: system-aware dark mode and mobile navigation/filter/control improvements. Palette contrast tests and multi-route light/dark 320/390/1280px checks passed; see [appearance guidance](docs/APPEARANCE_ACCESSIBILITY.md).

- [x] Replace hardcoded example spaces and raw entity gallery with dynamically discovered connection groups and space filters. Build, 26 tests and live Books-to-curation browser flow verified September 11; see CONNECTIONS.md.
- [ ] Extend Connections to verified debate and outreach relationships when integration contracts are ready.

- [x] Remove visitor-facing pipeline/source banners and routine fetch diagnostics throughout education, curation, maps and preferences. September 11: build and browser inspection; count-method detail is optional. User-authored Geo text unchanged.

- [x] Correct distorted chart markers/axis, retain responsive row labels, and organize education navigation by purpose. September 11: build and desktop/mobile geometry/filter checks passed; see EDUCATION_DASHBOARDS.md and APP_BOUNDARIES.md.

## Location map

- [x] Connect Curation to the user-selected Geo post `fd024e4f126343af98c61c32ae6f917e` (Educator turned builder). September 11: live reader, post discovery, ordered Markdown, dynamic Books references, build and 24 tests verified. See EDITORIAL.md. Keep the user's wording on Geo.

- [x] Implement lazy Leaflet map, direct space-scoped Geo discovery, bounded pagination, persistent expiring cache, missing-coordinate list and source links. September 11: build, 21 tests, four live locations, desktop interaction, cache reload and mobile layout verified. See LOCATION_MAP.md.

- [ ] Add dataset/study grouping to location record details and separately scoped outreach mapping after publication.

# TODO

- [x] September 14: restore live Reading First/Perry observation panels. Geo decimal strings now remain typed numbers in reusable adapters; Reading First’s seven effects and four actual-versus-counterfactual means, plus Perry’s 24 named-arm pairs and 24 perspective/horizon-labelled scenarios, rendered on the deployed site. Tests (70), formatting, production build and keyboard/table checks passed. Browser verification found dark-mode, zero-overflow Reading First tables at 375px and 1265px. Version 0.3.1 feature deployment `fca83e06`; metadata deployment `b67e320f`. Source commit `b3082e3` is pushed; the release-record commit awaits local GitHub authentication. No Geo content was changed.

- [x] September 12: deploy user-authorized 5% neighbor budget on linux-cloud: separate Reticulum transport identity/UID, durable 50 MB monthly ceiling, daily kernel quota, systemd timer and CPU/memory bounds. Budget tests and live loopback quota cutoff passed; two backbone connections established. See docs/NEIGHBOR_NODE.md.
- [ ] Observe neighbor-node rollover, restart recovery, useful transit and measured daily traffic; connect private budget-exhaustion alerts after Retichat reverse delivery is verified.

- [ ] Implement the owner-requested maintenance coordinator: verified deadlines, bounded dependency checks, private alerts, independent missed-heartbeat observer and verified free renewal adapters. Design only; channel selection and account re-verification pending. See docs/MAINTENANCE.md.

- [x] September 12: deploy version 0.2.0 About and Recent changes under Preferences, using Cloudflare completion timestamps and browser-local unread dots. Production verified seven entries, older-visit dot, clearing on reading, reload persistence and mobile dark layout; build, formatting and 65 tests passed. See docs/RELEASES.md for future commits.

- [x] September 12: automatic content images by default with saved ask-before-download preference. Existing preferences migrate without losing follows; browser tests verified default load, manual gating and reload persistence. Build and 63 tests pass. See LOCAL_PREFERENCES.md.

- [x] September 12: study installed SDK 0.20.3 and upstream block/image renderer; census all 90 blocks in 27 catalog datasets (no unsupported kinds observed). Add click-to-load IPFS Image entity blocks; synthetic browser response verified 0 requests before click / 1 after, retaining eight STAR results. See docs/GEO_BLOCK_SUPPORT.md.
- [ ] Implement saved filter/view semantics and bounded query/relation-source blocks based on upstream contracts; current collection view is not an exact replica of every Geo table setting.

- [x] September 12: explicit block capability detection, lightweight type/source metadata reads, unsupported-content links and retained unavailable catalog/block entries. Browser intercepted-read tests verified changed-source and missing-dataset recovery; build, formatting and 62 tests pass. See EDUCATION_DASHBOARDS.md.

- [x] September 12 local checkpoint: derive grouped result filters from published named relationships instead of fixed grade/arm/comparator IDs. Preserve role+target identity and unique loaded-record counts; rename/removal/role tests pass. Browser Head Start filter reduced four records to one; 390px had no overflow. Build and 59 tests pass. EDUCATION_DASHBOARDS.md now describes current implementation instead of retired static/editorial behavior. Not deployed.

- [x] September 12 local checkpoint: result collections use ordered cursor pages, at most four new 25-edge pages per action, with explicit Load more controls. Partial collections do not produce a comparison chart. Continuation/context/cursor tests pass; all 56 tests and build pass. Other collection entry points still need per-action bounds.
- [x] Dataset detail references now use the shared membership-aware resolver. Browser delayed-response test verified that changing target/membership cannot render the old destination. Live STAR retained eight records; newly published Head Start appeared as dataset 27 with six selectable blocks and no app code change. Not deployed.
- [x] Receive draft outreach query contract and distinguish missing publication from adapter gaps: publisher's scoped census found zero destination Datasets; eight intake rows are not published services. See [contract](../geo-publisher/docs/indianapolis-outreach-query-contract.md). Operational mappings, public coordinates and publication remain queued.

- [x] September 12 local checkpoint: replace Public conversations title-keyword/tag discovery with native classified Claim pagination and rename tab Public responses. Expansion reads actual arguments/sources; remove dormant published-reading-list state while retaining local drafts. Browser verified 40 Claims and response counts; 54 tests/build pass. Broader cross-space discovery remains pending.

- [x] September 12 local checkpoint: remove retired STAR-only component/adapter and empty public editorial JSON; retain the static-publication guard without unreachable writer code. Replacement plot-contract tests cover zero/missing values and edited unit/study/comparator/estimand. All 53 tests and build pass.
- [x] Browser mutation verification: intercept read responses only (no Geo mutation); collection member removal changed eight results to seven, restoration returned eight; unit edit removed chart while retaining eight readable records. Restoring response recovered the eight-point chart.
- [x] Add stale visible-tab revalidation for dashboard and curation; no interval polling. Remaining adapters still require lifecycle migration.

- [x] September 12 local checkpoint: replace Books/profile and first-space routing assumptions with shared membership-aware reference links in curation, atlas and Connections; retain ambiguous destinations as on-demand choices. Connections now includes supporting/opposing/related-Claim edges. Curation uses neutral or browser-saved selection rather than a fixed post. Browser verified live book/profile links and persisted selection; 53 tests and build pass. Not deployed.
- [x] Confirm living catalog addition: publisher-added teacher coaching appeared as the 26th dataset through the existing reader with no member-list code change, September 12.

- [x] September 12 local checkpoint: dashboard picker reads the publisher's ordered 25-member native catalog, opens dataset result blocks and methods text, and derives STAR grade/arm labels from Geo. STAR eight-point plot and Reading First/Perry collections read successfully. Not deployed; broader chart contracts, refresh lifecycle and remaining adapters still need work.
- [ ] Finish dashboard validation: export/test chart eligibility, verify outcome/instrument compatibility beyond the current grade/arm contract, remove retired STAR component and unused space-wide discovery, add incremental collection coverage controls and selected-result detail revalidation.

- [x] September 12: integrate original Questions through native dataset Blocks/Collection item traversal. All 21 records loaded live in source order; actual Answer targets are separate from Claims. Local browser search/dialog/Escape and dark 390px verified with direct Geo requests. Shared reader mutation/cache tests added; 48 tests and build pass. Not deployed yet.
- [ ] Finish migrating remaining adapters to the shared reader; bound collection discovery per user action, add broader capability-based datasets, and verify live removal/refresh behavior across screens before claiming living-graph integration complete.

- [x] September 12: design edit-aware Geo collection discovery and view capabilities. Verified native STAR collection structure and Question/Answers identities through read-only API calls; see [living Geo design](docs/LIVING_GEO_DESIGN.md). Implementation remains pending.
- [x] Prove native result-collection discovery on STAR with linked grade/arm concepts; reader/order/plot tests and browser removal/unit-change cases passed. Reading First, Perry, coaching and Head Start collections use the same reader; chart support stays limited to validated semantics.
- [ ] Implement scoped shared request/cache lifecycle and verified reference contexts incrementally, including refresh generations and deletion handling, following the living Geo design.

- [x] September 12: audit remaining hardcoded content and discovery constraints against source baseline `eba5e11`. See [prioritized audit](docs/HARDCODED_CONTENT_AUDIT.md); this records findings, not completed migrations.
- [x] Resolve reference destinations from verified membership in curation, atlas, Connections and dataset details; ambiguous spaces offer a choice. Browser reference and late-response cases verified September 12.
- [x] Verify native Question/Answers contract and integrate independent question discovery; 21 original Questions read in published order, with no fabricated Answers.
- [ ] Add a verified editor-maintained Geo collection contract for featured curation selection; preserve user authorship and explicit selection.
- [x] Retire unused empty public editorial JSON, unreachable importer write code and dormant published-reading-list state; build and tests passed September 12.

Use `[x]` only for completed work with evidence. Add dates and concise verification notes as items are finished. Historical suggestions in the pasted conversation are not completion evidence.

## Completed foundation

- [x] Audit shipped snapshot dependencies September 12: atlas and questions use the identical local/hosted 76/106/21 reference file; live dashboard remains STAR-specific. See [audit](docs/LOCAL_DATA_AUDIT.md).
- [x] Replace atlas/questions snapshot reads with scoped paginated live adapters; remove shipped education JSON. Build and 33 tests pass; browser search/detail checks recorded in the audit.
- [ ] Complete original 76/106/21 field-level reconciliation and restore supported assessment/question features only after verified contracts. See [publisher handoff](docs/PUBLISHER_DATA_GAPS.md); a copy is in publisher docs/companion-data-reconciliation-2026-09-12.md.

- [x] Add shared local preferences and live Geo user search with ID-only follows, bounded caching, multiple selections and removal. Build, 17 tests and browser flow verified September 11; see LOCAL_PREFERENCES.md.

- [ ] Collect the user's own thoughts on each of the four books, with exact text selected by the user before publication. Assistant-written book curation was rejected and withdrawn.

- [x] Publisher confirmed preliminary editorial publication stopped and no book/editorial collection or claim was submitted; preparation was read-only/local. September 11, 2026.

- [ ] Implement a profile-scoped Geo reader for the user's selected published writing; no Cloudflare-bundled editorial content or static fallback.

- [x] Add primary Education dashboards and Curation views. September 11: live STAR eight-row values reconciled, grade/arm browser filters verified, 10 tests and production build passed. See EDUCATION_DASHBOARDS.md.

- [x] Capture Thomas's editorial focus and four requested books with attributed preliminary notes and caveats. BOOK_CURATION.md delivered to the existing publisher task, which acknowledged it.

- [ ] Verify publisher's preliminary personal-profile collection and integrate its exact IDs and query contract. Detailed book breakdowns belong in the Books space.

- [ ] Expand live education dashboards beyond STAR to Perry, Saga and Reading First; complete structured filters and justified cost/outcome comparisons required by the bounty.

- [x] Capture the intended Geo/IPFS + React + Cloudflare + lightweight VM design. See README.md and ARCHITECTURE.md.

- [x] Create the Google Cloud VM. Supplied metadata records `linux-cloud`, `e2-micro`, `us-central1-a`, and a 30 GB attached boot disk.

- [x] Confirm Windows OpenSSH is installed. Verified in this task on 2026-09-11.

- [x] Configure the laptop alias `ssh linux-cloud` and register its public key. Successfully used on 2026-09-11.

- [x] Verify login and sudo. SSH returned `thomasfreestone`, `linux-cloud.free`, and UID `0` on 2026-09-11.

- [x] Initialize repository guidance, architecture, deployment notes, and this checklist.

- [x] Document trial-credit context and distinguish it from the site requirements. BILLING.md includes official references checked on 2026-09-11; account eligibility remains unverified.

## Next decisions and prerequisites

- [ ] **Priority: configure Google Cloud cost controls before deployment.** Target $0 ongoing charges; complete the budget and eligibility checks below first.

- [x] Capture user-selected Geo SDK/API references and sample space/entity. Both IDs returned successfully from the supplied testnet endpoint on 2026-09-11; see GEO.md.

- [x] Verify unauthenticated Geo reads and HTTP CORS/preflight headers from the supplied endpoint on 2026-09-11. Deployed browser behavior and rate limits remain unverified.

- [ ] Verify the Geo API endpoint, schema, authentication, browser CORS, and request limits.

- [ ] Select a sample IPFS CID and working gateway; record pinning/availability responsibility.

- [ ] Decide the VM's exact forwarding role and destination. Proposed first test: a small HTTP redirect to the Cloudflare frontend.

- [x] Implement React + Vite + TypeScript static build. Production build passed on 2026-09-11; actual commands in README.md.

- [ ] Verify actual boot disk class and applicable Google Cloud free-tier eligibility, including external IP and egress.

- [ ] Inspect billing account status, current charges, and budget/alert settings. Earlier conversation claims do not prove these are configured.

- [x] Record trial expiration and remaining credit in BILLING.md. User console screenshots confirm Free Trial, USD 300.00 remaining as displayed, and expiration December 4, 2026.

- [ ] Decide how to maintain the site after trial expiration; record the billing decision and verified allowances before relying on continued VM availability.

- [ ] Initialize Git and decide whether a remote repository is needed. Never commit credentials.

## Google Cloud budget and zero-cost target

- [ ] Review current project charges and trial/billing status, including charges covered temporarily by trial credits.

- [ ] Verify all provisioned resources qualify for applicable free allowances: VM hours/region, disk class/size, external IP, and outbound traffic. Record any chargeable resource.

- [x] Create a project-scoped monthly alert budget. Geo-Companion-zero-cost-watch uses USD 1 with actual alerts at USD 0.01/0.50/1 and forecast at USD 1; includes credits. Verified API response September 11, 2026. This is not a spending cap or permission to spend.

- [x] Confirm notification configuration and record the budget details. Default billing IAM recipients enabled; account IAM lists the user's Gmail as billing administrator. Email delivery remains untested; see BILLING.md.

- [ ] Verify whether an enforceable spend cap is available for this account and covers Compute Engine, disk, IP, and networking charges. Record exclusions and enforcement delays; do not assume coverage.

- [ ] Define the response to unexpected charges, including which services to disable or remove and how to preserve needed data. Stopping a VM may leave billable disks or reserved addresses.

- [ ] Review billing after deployment and periodically thereafter; check trial-credit offsets and reporting delays before concluding usage is free.

Budget alerts alone do not enforce the $0 target. If the chosen configuration cannot meet it, revise the hosting plan before deployment and document the tradeoff.

## Build the proof of concept

- [x] Define the first app as an Education-Initiatives viewer backed by live Geo data. Source schema/loaders inspected and publisher handoff prepared on 2026-09-11.

- [x] Place the handoff in the user-identified geo-publisher workspace. Added docs/education-initiatives-handoff.md and agents.md/todo.md pointers on 2026-09-11.

- [ ] Receive acknowledgment from the publisher agent and its initial mapping plan.

- [ ] Agree with the publisher on the target space, source commit, ontology mapping, stable IDs, and query contract.

- [ ] Receive publisher dry-run and reconciliation plan; track authorized publishing and indexing as separate steps.

- [ ] Verify one published initiative with its citations and available comparison relations as the first integration slice.

- [ ] Replace static content imports with runtime Geo reads; verify refreshed content appears without rebuilding the frontend.

- [x] Scaffold the React app and document working install/dev/build commands on 2026-09-11.

- [x] Add public endpoint/space settings in src/public-config.ts; root .env loading disabled in Vite.

- [x] Render live Geo entities and debate-tagged education claims in the deployed browser on 2026-09-11.

- [ ] Load and display at least one IPFS resource directly from the chosen gateway.

- [x] Handle loading, empty results, request failure, and malformed content. Adapter tests and browser-injected HTTP 503 verified on 2026-09-11.

- [x] Keep private credentials out of the client build. Vite env loading disabled, explicit public config, static-only output guarded before upload; no wallet reads used for this prototype.

- [x] Verify production build and meaningful integration behavior. Seven tests and deployed browser checks recorded in DEPLOYMENT.md on 2026-09-11.

## Debates and editorial prototype

- [x] Discover research questions dynamically and render explicit argument neighborhoods with shared browser caching. September 12: 40 live questions including all six Krueger–Hanushek Claims; both parents verified, 43 tests/build pass and 320/390/1280px layouts checked. See [static rules and dynamic data contract](docs/DYNAMIC_ARGUMENTS.md).
- [ ] Extend research discovery across deliberately selected additional spaces/source neighborhoods; legacy Public conversations still uses its bounded keyword/tag heuristic.

- [x] Queue personal-profile editorial publishing after education data; publisher guidance and canonical publishing_queue.md created on 2026-09-11. This records the plan only, not publication.

- [ ] After the publisher completes its editorial pilot, replace the prototype's static editorial source with verified, profile-scoped Geo reads; preserve order, rationale, sources and error states.

- [ ] Verify editorial/profile appearance on Geo and that every heavy asset is delivered from Geo infrastructure or Cloudflare, with no VM bulk traffic.

- [x] Discover live education-related debate-tagged claims and aggregate public curation/stance/veracity separately. Verified schema and browser data on 2026-09-11; limitations in DEBATES.md.

- [x] Add sorting, title search, stance bars, source inspection and space-specific tally details.

- [x] Add local editorial preview, ordered featured picks, notes, persistence and export. Shared published content remains maintainer-controlled; browser test verified isolation on 2026-09-11.

- [ ] Publish the user's first approved editorial selection; initial published selection is empty.

- [ ] Add authenticated editor publication if required beyond the export/import prototype.

- [ ] Verify public views/watch-time/attention sources and completed-debate associations; do not substitute vote counts for those metrics.

- [ ] Improve education topic discovery beyond title keywords and add cursor-based complete coverage.

- [ ] Match live claims to reconciled education evidence with explicit relation provenance.

- [x] Design a conservative low-egress architecture. LOW_EGRESS_PROTOCOL.md defines scheduled collection, Cloudflare-stored immutable partitions, byte reservations and failure handling; not deployed.

- [ ] Implement and measure the low-egress protocol acceptance gates before deployment: bounded real Geo adapter, publication overhead, corruption/restart recovery, byte exhaustion and no visitor-to-VM traffic.

## Publish and connect

- [x] Choose a Cloudflare-provided Pages subdomain for the initial or ongoing frontend address. User accepted on 2026-09-11; preferred `geocompanion.pages.dev` availability remains unverified. Custom-domain approval is optional.

- [x] Create the Cloudflare API token. User reported creation on 2026-09-11; effective permissions remain to be tested.

- [x] Prepare local `.env`, blank `.env.example`, and `.gitignore` for project tokens on 2026-09-11.

- [x] Save the Cloudflare token in local `.env` and verify API authentication without logging it. On 2026-09-11, token status was active; zone, DNS, and Pages listing requests succeeded. Account/zone IDs were saved locally. Write access has not yet been exercised.

- [x] Select the preferred name `geocompanion`. User supplied it on 2026-09-11; see DOMAINS.md for researched options.

- [x] Complete Cloudflare account signup/login and verify account access on the free plan. User screenshots on 2026-09-11 show the Free zone and assigned nameservers.

- [x] Obtain Cloudflare nameservers and fill the EU.org request: `alina.ns.cloudflare.com`, `tim.ns.cloudflare.com`. Form values and subsequent DNS checks verified on 2026-09-11.

- [x] Create the EU.org contact. User screenshot on 2026-09-11 confirms handle `TF992-FREE` and validation instructions sent to Yahoo.

- [x] Confirm validated EU.org account access. Authenticated dashboard for the new handle `TF993-FREE` verified on 2026-09-11; use this handle going forward. Earlier handle `TF992-FREE` has unknown validation status.

- [x] Submit the domain application and pass EU.org's SOA/NS checks. User screenshot confirms request `20260911171723-arf-61727` saved for validation on 2026-09-11.

- [ ] Receive EU.org approval for `geocompanion.eu.org` and verify public delegation. Successful submission does not establish ownership or approval.

- [x] Register and connect `geocompanion.dpdns.org` using the free DigitalPlat slot. Nameserver update succeeded; user configured the Pages custom domain. HTTPS 200 and the Geo Companion page title verified September 11, 2026 at 20:12 UTC; see DOMAINS.md.

- [ ] Evaluate further free addresses if still desired. QZZ.IO now requires a paid slot and is excluded from the $0 plan; EU.org approval remains pending.

- [ ] Configure Cloudflare DNS nameservers and verify the zone becomes active after delegation.

- [x] Create Cloudflare Pages project `geocompanion`. API creation and subsequent GET verified `geocompanion.pages.dev`, production branch `main`, no Git source, and no deployment on 2026-09-11. Token write access confirmed.

- [x] Upload the static frontend to existing Pages project and verify successful production deployment on 2026-09-11.

- [x] Verify https://geocompanion.pages.dev and direct browser Geo CORS requests on 2026-09-11.

- [ ] Choose a free custom name if needed; verify current availability and terms, then configure DNS and HTTPS.

- [ ] Inspect VM listeners, firewall, and web-server state before forwarding changes.

- [ ] Configure and test the selected forwarding route, including TLS if exposed as HTTPS.

- [ ] Record frontend URL, forwarding URL, deployment settings, and rollback procedure.

## Acceptance and cost checks

- [ ] Confirm the deployed site displays the chosen Geo result and IPFS resource.

- [x] Inspect production browser network destinations: frontend from Pages and data directly from Geo; Google Fonts also requested. No VM traffic observed on 2026-09-11. IPFS resource integration remains pending.

- [ ] Verify any VM redirect sends a small response and does not proxy large assets or API results.

- [x] Verify desktop and 390px mobile layouts, no page overflow, and visible HTTP 503 failure behavior on 2026-09-11.

- [ ] Review actual usage/billing after the test and record the result; account for reporting delay.

- [ ] Update docs with final choices and check off only verified work.

## Deferred unless requested

## Indianapolis outreach directory

- [ ] Enforce contact-source links only in outreach adapters, API contracts and caches: no contact names, phone/email values or copied contact details. Publisher queue/intake guidance updated September 12; the supplied raw package must not become a frontend fallback.

- [x] Review the September 12 Open_Data package and update publisher queue item 4 with input hashes, 102-record reconciliation, schedule/evidence fixes, an eight-record pilot and map/query requirements. See [publisher intake](../geo-publisher/docs/indianapolis-outreach-intake-2026-09-12.md). This is a handoff, not publication or completed frontend integration.

- [x] Implement root app selector, independent education/outreach routes, All apps navigation, legacy education links and explicit preparation states. Build, 12 tests and desktop browser interactions passed September 11; details in APP_BOUNDARIES.md.

- [x] User selected Public good space `f24e3bbd26304474b7e0c2a0877f4bfe`; verified API page name and notified publisher September 11. No new space creation needed.

- [ ] Verify selector/outreach layout in a mobile browser and confirm production route behavior after deployment.

- [x] Queue the independent dataset and complete research/modeling specification, September 11, 2026. See [publisher specification](https://github.com/athsrueas-geocurator/geo_publisher/blob/main/docs/indianapolis-outreach-directory.md) and canonical publishing queue. No operational rows or destination are claimed verified.

- [x] User selected existing Public good space f24e3bbd26304474b7e0c2a0877f4bfe. No new space required; operational membership contract remains pending.

- [ ] Receive verified directory, schedules, coordination matrix, gap analysis and dataset-scoped query contract from the publisher.

- [ ] Implement a separate outreach directory view after the contract is verified; never mix education/profile content or present stale schedules as help available today.

## Other deferred work

- [ ] Evaluate frontend Geo editing and wallet authentication beyond the Education-Initiatives publishing migration.

- [ ] Evaluate decentralized frontend distribution and an explicit persistence/pinning plan.


- [x] Share triangle branding across root, education, outreach and preferences; compact selector with runtime primary-space Avatar lookup. Build and 28 tests passed, desktop/mobile checked.
- [x] Add isolated outreach map route and Indianapolis basemap with explicit empty state. OSM tiles loaded directly.
- [ ] Receive primary-space icons from publisher; verify rendered icons after publication.
- [ ] Connect outreach map markers after dataset membership, public-location privacy and coordinate contract are verified. No service markers claimed yet.

## Repository organization

- [x] Separate app shell, shared components, education and outreach modules. Add formatting commands and current architecture/development guides. Build, 28 adapter tests and formatting checks passed; local routes verified.
- [x] Document the future-commit checklist, required feature/deployment records and handling of local-only commits after failed Git authentication; consistency and relative links checked September 12.
- [ ] Push local commits once GitHub authentication is restored, checking remote changes first. Current deployment and source status are recorded in DEPLOYMENT.md.

## User-selected experiments

Details and open decisions: [Ideas to explore](docs/EXPERIMENTS.md). Recording these ideas does not enable telemetry or deploy a service.

- [x] Prototype two-person selection sessions on Cloudflare, with one-hour expiry, explicit invitations and bounded messages. Local runtime and hosted room creation passed September 12; see [coordination](docs/COORDINATION.md).
- [ ] Explore offline outreach directory access, starting with a browser-only approach.
- [ ] Explore a bounded agent research/checking queue on linux-cloud, with compact status and Geo publication through the existing publisher.
- [x] Prototype opt-in route/selection counts and public thresholded aggregates in D1. Local aggregation tests passed; raw searches and identities excluded. Production has no test telemetry seeded.
- [ ] Define useful unmet-demand categories with the editor before expanding telemetry; no raw-search logging.
- [x] Research Linux embedded in web apps independently of the unused Google VM. September 12 report covers community experiments, primary-source distinctions, licensing/egress constraints and proposed tests: [research](docs/LINUX_BROWSER_RESEARCH.md).
- [x] Investigate experiments benefiting from a real Linux host after scope clarification. September 12 [host research](docs/LINUX_HOST_RESEARCH.md) separates kernel networking, disconnected messaging and rendezvous from browser/Cloudflare alternatives; documents sources, byte arithmetic and unverified assumptions. No host changes.
- [ ] Choose between a bounded network-protocol lab and a closed LXMF bulletin experiment; inspect VM capabilities and budget before installation, then measure actual resource use and exported bytes.
- [ ] Select a useful, reproducible education experiment and compare a minimal browser-native runner with a Linux-based runner; measure cold/warm transfer and actual mobile usability before integration.
- [ ] Verify room expiry after a full hour, hibernation/billing behavior under realistic traffic, daily scheduled retention cleanup and abuse resistance before expanding the prototype's quotas.

## Visual restoration

- [ ] Restore live source-overlap comparisons and category/source summaries, then add compatible paired-mean, interval and economic-scenario renderers. The Initiative atlas reads Category relation `06c899fb04334e679feb1fd56687c3d6`, preserves unclassified entries, shows live category counts, and stores up to three selected initiative IDs locally for a live source-overlap comparison. The dashboard now renders typed paired observations, source-modelled Perry scenarios, Reading First means and compatible effects; mobile/browser verification and source-to-render checks remain. Follow [visual restoration audit](docs/VISUAL_RESTORATION_AUDIT.md); do not restore bundled content.
- [ ] Receive publisher mappings for attributed assessments, original category/method coverage, question continuums/evidence links and unresolved place scopes before recreating the old dot matrix or continuum bands. Audit and canonical queue updated September 13, 2026; no Geo publication or frontend deployment performed.
