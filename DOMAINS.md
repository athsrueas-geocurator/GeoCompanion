# Domain and Cloudflare setup

## Naming decision — 2026-09-11

The user selected `geocompanion` as the preferred name, including additional free addresses. The cost target is $0 with the strongest practical prospect of continued free use. Both `geocompanion.pages.dev` and `geocompanion.dpdns.org` serve the deployed frontend over HTTPS.

## Candidates

| Name | Assessment | Status |
| --- | --- | --- |
| `geocompanion.eu.org` | Recommended independent free subdomain application, based on EU.org's history since 1996. Approval and future operation are not guaranteed. | Application submitted; approval pending |
| `geocompanion.pages.dev` | Cloudflare-hosted frontend. Tied to Cloudflare hosting. | Live HTTPS deployment verified; latest deployment f8532002 |
| `geocompanion.qzz.io` | Authenticated dashboard now requires a $3 paid slot for new registrations. | Excluded from current $0 plan |
| `geocompanion.dpdns.org` | Registered using a free DigitalPlat slot. Dashboard displays expiry September 10, 2027. | Pages custom domain configured; HTTPS 200 and Geo Companion page title verified September 11, 2026 |

These are subdomains under another organization's domain. None provides ownership of a top-level namespace or a guarantee of perpetual free service. Provider reputation is a judgment, not a verified probability of future availability.

## Additional addresses — 2026-09-11

DigitalPlat's public site lists qzz.io, dpdns.org, us.kg, xx.kg, and qd.je. The authenticated dashboard subsequently showed one free slot, zero paid slots, and zero registered domains. Its notice says US.KG and XX.KG registrations are paused and new QZZ.IO registrations require a $3 paid slot. Dashboard evidence supersedes the public landing page's broad availability labels. It states free renewals are available within 120 days before expiration; no renewal has been performed or scheduled.

GitHub verification returned `github_kyc_verified`. The user completed free registration, confirmed by the authenticated domain management page for `geocompanion.dpdns.org`. It displays registration September 10, 2026 and expiry September 10, 2027; these are dashboard-displayed dates. No paid slot purchase was made.

The user's Cloudflare onboarding screenshot supplied `alina.ns.cloudflare.com` and `tim.ns.cloudflare.com` for this setup. Both were entered in DigitalPlat's nameserver form, which returned "Update successful. Please wait a while for DNS propagation to take effect." Subsequent screenshots show the zone Active and the Pages custom-domain association initializing. Direct verification at 20:12 UTC on September 11, 2026 returned HTTPS 200 with Cloudflare headers, the application's CSP, and the title "Geo Companion — Education debates & evidence" at https://geocompanion.dpdns.org. This verifies service from the checking location; the Pages dashboard status has not been rechecked.

is-a.dev was also reviewed, but requires a non-commercial software-development-related project or personal developer site and a reviewed GitHub pull request. Suitability for this education-focused application has not been established; no application was submitted.

## Account setup observations

Initial API verification on 2026-09-11 confirmed an active token loaded from local `.env`, readable zone/DNS records, and readable Cloudflare Pages projects. At that time the zone status was `pending`, DNS record count was zero, and the Pages project list was empty. Subsequently, the `geocompanion` Pages project was created and deployed successfully at https://geocompanion.pages.dev, demonstrating Pages write access. EU.org zone activation remains unverified. Verified account/zone IDs were saved in `.env`; no credentials were logged.

The user's Chrome screenshots on 2026-09-11 confirm authenticated Cloudflare access and a Free zone for `geocompanion.eu.org`, awaiting nameserver delegation. Assigned nameservers: `alina.ns.cloudflare.com` and `tim.ns.cloudflare.com`. EU.org's submission output confirms that SOA and NS checks passed for both servers and the request was saved for validation. Cloudflare zone activation is not yet verified.

The active EU.org contact is `TF993-FREE`, confirmed on 2026-09-11 by the authenticated domain dashboard and new-domain form. The earlier `TF992-FREE` registration was not the account used for this successful login; its validation status is unknown. The user submitted the domain application on 2026-09-11. Screenshot evidence: "No error, storing for validation", request `20260911171723-arf-61727`, and "Done". This confirms submission, not domain approval or delegation.

EU.org's direct-subdomain policy was reviewed on 2026-09-11: it provides NS delegation, and may refuse a direct registration where a nested domain would be appropriate. See https://nic.eu.org/top-policy.html. Domain approval and name availability remain unverified.

## Planned sequence

1. Complete Cloudflare signup/login and verify the email/account. Stay on free services.
2. Create and validate the EU.org contact using an appropriate non-Gmail email address; retain the assigned contact handle.
3. Verify name availability and the domain application requirements. Prepare a Cloudflare Free DNS zone and obtain its assigned nameservers when supported by the onboarding flow.
4. Submit the domain application with valid DNS information. Record submission and approval separately; a pending application is not registration.
5. Verify authoritative nameservers and Cloudflare zone activation after delegation.
6. Once a static build exists, create the Cloudflare Pages project, verify the available project name, and publish the frontend.
7. Add the approved domain through Pages custom-domain setup, verify its DNS record and HTTPS, and record live URLs.

Do not point the main frontend at the VM simply to make it part of the route. Its optional forwarding role remains a separate architectural decision. Budget checks remain prerequisites for deployment work that uses Google Cloud resources.

## Sources checked 2026-09-11

- [EU.org purpose and history](https://nic.eu.org/)
- [EU.org contact registration](https://nic.eu.org/arf/en/contact/create/)
- [DigitalPlat namespaces](https://domain.digitalplat.org/)
- [DigitalPlat terms](https://domain.digitalplat.org/terms-of-service/)
- [Cloudflare Pages subdomain](https://blog.cloudflare.com/big-ideas-on-pages/)
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)

No domain, Cloudflare account, DNS zone, or deployed project has been marked complete based solely on opening signup pages.
