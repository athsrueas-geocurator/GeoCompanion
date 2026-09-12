# Maintenance coordinator — proposed September 12, 2026

Status: design and implementation queue only. No daemon, reminder, message channel, renewal or automatic action has been enabled. The user has requested operational reminders and narrowly predefined upkeep; alert channel and delivery credentials remain to be selected.

## Purpose and ownership

Linux-cloud can maintain a small SQLite database of maintenance obligations, execute bounded checks while browsers are closed, and send compact status changes. This database is private operational state, not a replacement for Geo's canonical content. The website continues to function without the coordinator. Link this work to the [current architecture](../ARCHITECTURE.md), [deployment record](../DEPLOYMENT.md) and [Open_Data](https://github.com/athsrueas/Open_Data) if a collector later needs supervision; do not imply that an ongoing collector is already deployed.

Use a short-lived Python standard-library runner under a systemd timer. Store tasks, observations, action receipts and an alert outbox in SQLite. A task records resource ID, check type, next check, deadline and timezone/date precision, verification source/time, failure count, action policy and notification state. Secrets are environment/file references, never database values or public API output. Actions are named adapters with fixed resource and destination allowlists, never shell commands supplied by an API response.

## Initial obligations

| Obligation | Proposed check | Action |
| --- | --- | --- |
| Google Cloud trial | Reverify billing/account status and recorded trial deadline daily | Remind 30, 14, 7, 3 and 1 days before; report changes. No automatic paid upgrade. |
| DigitalPlat domain | Verify actual domain expiry and renewal window from account/provider evidence daily | Execute free renewal only after a supported API and its zero-charge behavior are verified; otherwise send the exact dashboard link and required step. |
| Geo API | Small read-only application-shaped GraphQL query hourly | Detect HTTP, GraphQL and required-shape failures; distinguish missing content from endpoint failure. Retry with backoff; alert on persistent failure and recovery. |
| Pages and custom domain | Bounded HTTPS check hourly for both addresses, plus periodic DNS/TLS check | Compare domain failure with working pages.dev to narrow the cause. Report, without automatically changing DNS. |
| Coordination service | Existing read-only health endpoint hourly | Alert after repeated failure; no test rooms or visitor telemetry writes. |
| Coordinator itself | Authenticated heartbeat and last successful run | Independent observer raises an alert when overdue. |
| Provider credentials | Observe authorization errors and documented expiration, if supplied | Alert for replacement; never infer an expiry or rotate into broader permissions automatically. |

Historical screenshot evidence, not current account verification: Google trial date December 4, 2026; DigitalPlat domain expiry September 10, 2027, with free renewal shown within 120 days of expiry. Keep account-specific seed dates in private configuration, and verify them before enabling actions. Date-only evidence must not be presented as an exact shutdown time.

Google documents that trial workloads stop when the trial ends unless upgraded: [official FAQ](https://cloud.google.com/signup-faqs), [Free Program documentation](https://docs.cloud.google.com/free/docs/free-cloud-features). Trial expiration and exhaustion of credits are distinct triggers. This review did not establish a supported DigitalPlat renewal API; do not copy an undocumented dashboard endpoint into unattended production automation.

## Independent reminder and delivery

The machine being monitored cannot reliably report its own shutdown. Mirror only critical deadlines and a compact last-heartbeat record to a separate Cloudflare service. That service independently checks missed heartbeats and critical dates and can deliver the same owner alerts if Linux is unavailable. Keep its deployment, credentials and notification path independent of the VM. Cloudflare failure remains a separate failure mode, so mirror verified critical dates to the owner's calendar as an optional additional fallback.

Choose the owner's delivery channel before deployment. Proposed message: resource, observed problem or approaching date, attempted action/result, and one direct next-step link. Send actionable changes promptly; batch successful upkeep into a digest. Record delivery IDs/status, deduplicate incidents, honor a cooldown and send one recovery notice. An API's acceptance of a message is not proof the owner read it. Failed delivery stays in a bounded retry outbox and appears in the independent status record. No public contact directory or outreach client information belongs here.

## Automatic-action rules

The user's request authorizes pursuing free keep-alive/renewal actions where a provider explicitly offers them. Each enabled adapter still needs a verified contract, exact resource, zero-charge precondition, eligible renewal window, bounded retries and post-action verification of the new expiry/status. Log the before/after state and provider receipt. On timeout, read current state before retrying; uncertain success must not cause duplicate actions.

Payment, paid-plan upgrades, domain transfer/deletion, ownership changes, broader credentials, DNS replacement and Geo publication need separate explicit authorization. Provider messages can supply data but cannot expand these permissions. If no eligible free action exists, report the blocker and link to the owner's next step. Do not claim maintenance succeeded merely because a request returned HTTP 200.

## Resource bounds and acceptance

Proposed initial limits: hourly health checks; daily deadline checks; 10-second check timeouts; response bodies capped at 32 KiB; three consecutive health failures before an incident; honor Retry-After; at most two retries per run. A single auth failure can create a credential incident rather than repeatedly hammering the service. Bound each run, lock against overlapping runners and persist the next due time. Urgent approaching deadlines do not wait for three checks.

Transmit changed status and a daily heartbeat rather than raw responses or logs. Keep at most 30 days of detailed checks and 90 days of action receipts, with compact current state retained. Initial coordinator egress target: below 10 MiB per month, to be measured, not guaranteed. Count request headers, TLS, DNS, retries, alerts and heartbeat traffic; small application payloads alone do not establish network usage. This target excludes unrelated VM work and package updates.

Before enabling writes: run a bounded read-only test, verify account dates and notification delivery, simulate overdue deadlines/HTTP errors/GraphQL errors, duplicate runs, clock changes, ambiguous renewal responses and a stopped Linux runner. Verify the independent alert still arrives with Linux offline. Enable each free-action adapter only after its contract and read-back behavior pass. Document measured bytes and exact deployed service versions.

## Implementation queue

1. Select alert channel and configure owner destination privately; reverify Google/DigitalPlat dates.
2. Build local SQLite runner, task adapters and notification outbox in dry-run mode; test deadlines, failure transitions and action idempotency.
3. Add independent Cloudflare deadline/heartbeat observer and authenticated compact ingestion.
4. Run a bounded read-only Linux test and an explicit delivery test to the owner.
5. Verify provider-supported free renewal/keep-alive APIs; enable only qualifying adapters.
6. Deploy timers, retention and delivery retries; record operational evidence and update TODO.
