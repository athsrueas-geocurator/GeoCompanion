# Ideas to explore

These are user-selected directions. Shared exploration and opt-in coarse telemetry now have a [Cloudflare prototype](COORDINATION.md); the remaining ideas are research, not deployed features. Linux-cloud is unnecessary for the current runtime. See [TODO](../TODO.md) and the [current architecture](../ARCHITECTURE.md).

## Next research: Linux embedded in web apps

September 12 update: the user identified a concrete operational queue role: trial/domain deadlines, broken dependencies, owner reminders and verified free keep-alive actions. See [maintenance coordinator design](MAINTENANCE.md). This is now queued for implementation; it remains separate from public content processing and is not deployed.

The [September 12 research report](LINUX_BROWSER_RESEARCH.md) compares real-kernel emulation, Linux syscall compatibility, native Wasm tools and community experiments, with proposed Geo Companion applications. This is documented research, not a deployed emulator.

Investigate actual Linux emulation in a browser, what useful interactions it enables, initial download size, memory/CPU on phones, offline caching, and boundaries between emulation and browser-native runtimes. Keep this separate from deploying services on the Google VM. No emulator dependency or download is currently added to Geo Companion.

## Temporary shared exploration

Two people temporarily explore the same Geo entity or map selection together. Exchange small messages such as space/entity IDs, selected filters and, if useful, map position. Each browser fetches public content independently from Geo or the existing content providers.

No file transfer, screen video or large-content relay. Explore invitation-based sessions, explicit joining/leaving, and whether following the other person's selection should be optional. Measure signaling, connection maintenance and retries as well as message bodies. Peer connections introduce reliability and privacy tradeoffs; do not silently enable a bandwidth-heavy relay when a direct connection fails.

Reference: [PairDrop](https://github.com/schlagmichdoch/PairDrop) and its [hosting/fallback documentation](https://github.com/schlagmichdoch/PairDrop/blob/master/docs/host-your-own.md). This is an architectural reference, not a decision to install PairDrop.

## Offline outreach exploration

Let an outreach worker save a small, useful directory selection and continue searching services, contacts and schedules without a connection. This may need no Linux service: browser storage and carefully bounded downloads could be enough.

Start with verified public service records. Keep verification dates and offline/stale status available; a saved schedule cannot establish that a service is open now. Separate the directory from any map-tile download plan, which needs its own provider terms and byte budget. Never include private encampments or undisclosed routes.

Reference: [Kolibri's offline-first approach](https://learningequality.org/kolibri/about-kolibri/). The experiment is offline access to the outreach directory, not hosting educational media on the cloud VM.

## Small agent work queue

Use linux-cloud to coordinate bounded research and checking jobs that can continue while a browser is closed. Expose compact job status and references to results; Geo remains the destination for canonical publication. The queue should complement the existing [publisher](https://github.com/athsrueas-geocurator/geo_publisher), not create a competing publication system.

Investigate job IDs, queued/running/review-needed/completed/failed states, deduplication, cancellation, retry limits, and compute/API/egress budgets. Queueing work does not automatically authorize publishing editorial text or graph changes. A small server coordinating agents does not imply that a language model runs locally or that external inference is free.

Keep large results and visitor content off the VM delivery path. Decide whether status can be published periodically to Cloudflare instead of serving per-visitor requests from Linux.

## Search and selection telemetry

The user wants to explore learning from what people search for and select, both to inform what we add and to produce useful public telemetry. Potential questions include: which service categories are sought, where searches yield no results, which tools people use, and which dataset gaps deserve research.

Investigate small, batched events or aggregates rather than continuous detailed activity streams. Candidate fields are app, action, public entity/category ID and coarse time bucket. Raw searches may contain names, personal circumstances or sensitive needs, particularly in outreach; do not assume public source data makes visitor behavior public.

Before implementation, decide the visitor notice/control, collected fields, retention, and which aggregates can safely be public. Prefer on-device categorization or redaction over storing raw query text; omit precise user location and identity linkage by default. Public reports should avoid individual sessions and rare combinations. These are proposed design boundaries, not an implemented privacy guarantee.

Keep Companion usage metrics distinct from Geo's votes, blockchain history and evidence of real-world demand. Repeated clicks, bots and a small self-selected audience can distort counts. Telemetry can suggest a research job for the queue; it should not automatically determine editorial priorities or publish a claim.

## Current focus: experiments on a real Linux host

The [host research](LINUX_HOST_RESEARCH.md) follows the user's clarification: investigate capabilities beyond what our browser and Cloudflare setup already provides. The strongest candidates are a controlled kernel network laboratory and a closed Reticulum/LXMF messaging experiment. Neither is deployed or required by the production app. Routine queues remain deferred; persistence alone does not establish their value.

## How to evaluate the experiments

For each prototype, compare the benefit with a browser-only version first. Measure whole-transaction outbound traffic, including retries and connection maintenance, and whether it grows with visitors. Preserve Geo as the canonical source. The existing [low-egress protocol](../LOW_EGRESS_PROTOCOL.md) is a proposal, not proof that these experiments fit a measured budget.
