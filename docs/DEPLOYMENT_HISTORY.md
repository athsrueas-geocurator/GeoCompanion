# Historical deployment observations

Use [current deployment instructions](../DEPLOYMENT.md). Older plans below are historical.

## Connections — September 11, 2026

Deployment ff3047fc replaces the raw gallery with Connections. Build and 26 tests passed; local browser verified dynamic spaces and expandable book-to-post links. Current asset index-B5_25OGb.js.

## Interface copy cleanup — September 11, 2026

Deployment `cb0cc18c` removes pipeline banners and routine fetch diagnostics. HTTPS 200 and current `index-Dz_lPOPu.js` verified. Build passes; explorer and debates browser checks confirm refresh/navigation controls remain. User-authored Geo content and data behavior unchanged.

## Chart and navigation correction — September 11, 2026

Deployment `16ae4b41`: SVG geometry correction, responsive labeled plot and grouped sidebar. HTTPS 200 with current `index-B2Ju5zEW.js` verified. Build and desktop/mobile browser geometry and grade filtering passed. No data query or formula changes.

## Dynamic curation — September 11, 2026

Deployment `c649fb4b` adds runtime profile Post discovery, ordered Markdown and Books-space references. HTTPS 200 and current asset `index-NPRxUzbW.js` verified. Build and 24 tests pass; desktop/mobile reader inspected, no mobile overflow. Canonical text stays on Geo. See EDITORIAL.md.

## Location map — September 11, 2026

Deployment `85d44cec` publishes `#/education/map`. Custom-domain HTTPS 200, current asset `index-D5WTWnmF.js`, OSM image CSP and production browser rendering of all four Geo locations verified. Build and 21 tests pass; desktop/mobile, cached reload and place selection verified locally. See LOCATION_MAP.md.

# Deployment notes

## Local preferences and live profile search — September 11, 2026

Deployment `c1efd20e` adds Preferences & follows across apps. Custom domain returned HTTPS 200 with current `index-C8hcrEEp.js`; production browser rendered the preferences/search route with an empty follow list. Build, 17 tests and local live-search/persistence/removal browser checks passed. IDs only persist; profile metadata is fetched directly from Geo with bounded memory caching. See LOCAL_PREFERENCES.md. No editorial publication, identity authentication or VM endpoint was added.

## App selector — September 11, 2026

Deployment `b4d53b37` publishes the root selector and separate Education/Indianapolis Outreach modules to the existing Pages project. Custom-domain HTTPS returned 200 with the current `index-D52pcenk.js` asset; production browser verified both app links and preparation status. Build and 12 tests passed; local browser verified outreach navigation, Back, All apps and eight live STAR estimates. No operational outreach data is published yet. See APP_BOUNDARIES.md for routes and separation requirements. Mobile browser inspection remains pending.

## Editorial correction — September 11, 2026

Deployment `4b0209c7` removes the rejected assistant-written curation and book summaries from the current frontend. Curation contains neutral interface text and a Geo profile link pending user-selected writing and a verified reader. Static editorial loading/import publication is retired; local drafts are preserved. Publisher confirmed no book/editorial writes were submitted. Canonical editorial content must live on the user's Geo profile, in their selected words. Build passed; live HTML/asset verification confirms the correction.

## Education dashboards and curation — September 11, 2026

Deployment `28d8143f` successfully published to the existing Cloudflare Pages project. HTTPS 200, updated title and matching current JavaScript asset verified at both https://geocompanion.pages.dev and https://geocompanion.dpdns.org. Routes `#dashboards` and `#curation` are shareable. Ten tests, production build, real STAR source reconciliation and desktop/mobile browser checks passed; see EDUCATION_DASHBOARDS.md. CSP still permits direct Geo requests and excludes VM destinations. Preliminary book notes on the companion are not evidence of Geo profile publication; publisher verification remains pending.

## Prototype deployed — 2026-09-11

Live URL: https://geocompanion.pages.dev. Latest successful deployment: `f8532002` via Wrangler Direct Upload; production branch `main` (initial deployment `a28ddf94`). Build output: `dist/` only. No Git integration, Functions, Worker, VM proxy, or custom domain was added.

Commands: `npm ci`, `npm run dev`, `npm run build`, `npm test`, `npm run deploy`. Deploy explicitly loads only Cloudflare token/account ID from root `.env`, checks static output for unexpected files or known credential patterns, and runs Wrangler from `dist/`. Vite has environment loading disabled. Public config is in src/config/public-config.ts. Do not publish the project root.

Verification: TypeScript and Vite build passed; seven data/URL/vote-semantics/editorial-validation tests passed. Browser checks covered search, initiative detail, comparison, debate sorting and source inspection, local editorial save/reload/export and published-view isolation. Live Geo pagination returned 40 entities across two 20-entity requests. An injected HTTP 503 produced the expected failure message. Desktop and 390px mobile layouts had no page overflow; the atlas matrix and mobile navigation intentionally scroll horizontally within their containers.

The production browser loaded 29 education-related debate claims and public response tallies, with two requests directly to api-testnet.geobrowser.io. Other observed resources were from Pages and Google Fonts. No request went to linux-cloud. Browser console showed no errors. Global API rate limits remain undocumented/unverified. This does not establish Google Cloud billing or a zero bill for existing resources.

Rollback: keep a known-good Pages deployment available; use the project's Deployments rollback action, or rebuild and upload a known-good source copy to the same project. The working directory is not yet versioned in Git; do not claim a committed-source rollback exists.

## Observed infrastructure

Recorded from supplied VM/project metadata and the successful SSH test on 2026-09-11. Recheck before deployment; addresses and configuration may change.

| Item | Recorded value |

| --- | --- |

| Project | `project-f116896e-996d-4d11-95c` |

| VM / zone | `linux-cloud` / `us-central1-a` |

| Machine | `e2-micro`, Standard provisioning |

| OS | Ubuntu; metadata identifies the Ubuntu 26.04 LTS image family/license |

| Boot disk | 30 GB; underlying disk class still needs verification |

| External / internal IP | `136.65.92.219` / `10.128.0.3` |

| Linux hostname | `linux-cloud.free`; public DNS ownership unverified |

| SSH user | `thomasfreestone` |

| Login method | Metadata SSH keys; no OS Login enablement in supplied project/VM metadata |

| Sudo | `google-sudoers` membership and passwordless sudo verified |

| Web server / DNS / TLS | Not inspected or configured in this task |

## Existing Windows access

```powershell

ssh linux-cloud

```

The laptop's SSH config maps that alias to the recorded external IP and user, using its existing local Ed25519 identity. Its public key was added to the VM's SSH metadata. Do not copy the private key into this repository.

Verified command:

```powershell

ssh linux-cloud "whoami; hostname; sudo -n id -u"

```

Observed output: `thomasfreestone`, `linux-cloud.free`, and `0`. This confirms login and root command execution, not website deployment.

## Staged procedure

### Initial frontend address decision — 2026-09-11

The user accepts Cloudflare's free provider subdomain as the initial or ongoing address. Use a Cloudflare Pages project, aiming for `geocompanion.pages.dev` if available; the actual hostname remains unverified until project creation. EU.org approval is optional and does not block the provider address. Add a custom domain later through Pages if desired. See [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) and [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

Cloudflare Pages project `geocompanion` was created through the API on 2026-09-11 and verified with a subsequent project GET. Assigned hostname: `geocompanion.pages.dev`; production branch: `main`; no Git source connected; no canonical deployment yet. The hostname is assigned but no live site is claimed. Existing token write permission was exercised successfully. No paid subscription was requested.

Remaining Cloudflare work: deploy only the built static output, then verify HTTPS, routes, and direct Geo requests from its origin. No VM or forwarding service is required for this route; Google Cloud billing remains a separate outstanding responsibility.

### Next steps for this Pages project

1. In the Cloudflare dashboard, open Workers & Pages and select `geocompanion` to see the created project. No further DNS or account setup is required for the assigned provider address.

2. Build the React frontend locally once its integration requirements are confirmed. The project currently has no application build; do not upload the repository directory. The intended output is `dist/` only, with no `.env`, wallet, or deployment credentials.

3. Deploy the output to the existing Pages project using Direct Upload tooling and the saved token. Production uploads should specify branch `main`. This project has no automatic Git deployment; deploying through a future CI workflow remains possible.

4. Verify the assigned HTTPS address, deep links, loading/error states, and browser requests to Geo. Get the confirmed mapping and sample queries from the publisher before claiming dataset integration.

5. Optionally associate a custom domain through this project's Custom domains settings once domain control is verified.

1. Confirm the Geo documentation URL, real sample data, IPFS CID/gateway, and whether the VM should redirect HTTP or perform another specific forwarding function.

2. Verify the VM disk class, external address allocation, billing account status, applicable free-tier allowances, current charges, and budget settings. Do not assume the pasted cost estimates establish a zero bill.

3. Scaffold the React app after confirming the toolchain. Add public endpoint configuration, one real Geo read, one IPFS fetch, and loading/error states. Record the actual install/dev/build commands.

4. Test locally, then publish the static build to Cloudflare. Cloudflare Pages is the current candidate. Record the project, build settings, output directory, and preview URL. Build on the laptop or hosting build service rather than relying on the small VM.

5. Verify CORS and content requests from the published HTTPS origin. Confirm that the VM is not an API or asset proxy.

6. Use the Cloudflare-provided subdomain for the first test. If a free custom name is desired, verify availability, control, renewal rules, and DNS support before choosing it; no registrar is selected yet. Follow the hosting provider's custom-domain setup and verify HTTPS.

7. For a VM redirect experiment, inspect existing listeners and configuration first. Choose a forwarding hostname, configure DNS and TLS, add a temporary redirect to the Cloudflare URL, validate the server configuration, and verify the response. Open only the web ports required for that chosen route. Save previous configuration and record how to restore it.

8. Record the deployed URLs, browser network checks, forwarding result, and initial billing observations. Document how to redeploy the last known good frontend and undo the forwarding change.

## Cost and provider references

See local billing notes (not committed) for trial expiration, paid-account distinctions, and account observations still needed. The site should not depend on temporary trial-funded services.

Reviewed official references on 2026-09-11; account-specific eligibility remains unverified.

- [Google Cloud Free Tier](https://docs.cloud.google.com/free/docs/free-cloud-features): check current allowances and eligibility rather than promising permanent free service.

- [Google network pricing](https://cloud.google.com/vpc/network-pricing): verify external IP and outbound transfer billing for the actual allocation and usage.

- [Google budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets): alerts-only budgets do not cap spending. Verify any available spend-cap feature's scope before relying on it for this VM.

- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/): static hosting and any Functions/Workers usage have distinct limits. Do not generalize static bandwidth marketing to every Cloudflare service.

- [Google SSH key setup](https://docs.cloud.google.com/compute/docs/connect/add-ssh-keys): reference for maintaining laptop access.

No paid plan, domain registration, or production deployment has been performed as part of documentation initialization.
September 11, 2026: deployment 9e7b227f delivers shared triangle branding, compact runtime-icon selector and isolated outreach basemap. Production HTTPS 200 and index-DGJRVfaO.js verified; CSP permits the single Pinata image gateway. Live outreach map rendered 10 OSM tiles, with no service markers. Build and 28 tests passed.
