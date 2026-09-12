# Experiments that benefit from a real Linux host

Research date: September 12, 2026. Engineering research, not editorial content. Nothing was installed on linux-cloud; no network participation or deployment was enabled. This follows the user's clarification after the [browser Linux investigation](LINUX_BROWSER_RESEARCH.md).

## Finding

The strongest distinct capability is control of an actual operating system's network stack. The most unusual useful direction is small messages that survive disconnected recipients and different transports. Neither requires routing the Companion's Geo content through the VM.

Persistence alone is insufficient justification: Cloudflare already hosts the app's temporary rooms and optional counts. Ordinary scheduled jobs, HTTP endpoints, offline browser storage, and repeating Geo's publication history do not establish a new need for Linux.

These are candidate experiments, not verified e2-micro benchmarks. A real Linux host elsewhere could run them too; the Google VM is convenient, not uniquely necessary. No current account billing or VM configuration was inspected in this research.

## Shortlist

| Experiment | What Linux contributes | Possible Companion value | Traffic boundary | Assessment |
| --- | --- | --- | --- | --- |
| Deliberately bad network laboratory | Network namespaces, virtual interfaces, kernel traffic control | Test tiny selection messages, retries and reconnects under loss and long delays | Synthetic clients communicate inside one host; export compact results | Strongest match for our protocol research |
| Packet-level interactive lessons | Real system calls and kernel TCP behavior through packetdrill | Show why a tiny application message can cause substantially more wire traffic | Local virtual-device tests; browser receives a summary | Interesting educational companion experiment |
| Disconnected messaging with Reticulum/LXMF | Persistent native router and message propagation daemon | Explore short public operational bulletins that can be delivered later | Closed test network; bounded messages and peers | Most unusual application direction; participating clients required |
| Native rendezvous experiment | Listen on native protocol ports and retain presence state | Connect external devices without relaying their files | Only introductions, no automatic relay | Conditional; current browser sessions already work on Cloudflare |
| External network observation point | Native DNS/ICMP/path tools and an independent network location | Investigate whether a failure is specific to a browser or path | A small allowlist and infrequent probes | Useful toolbox, weak case for a new visitor feature |
| Native tracing/sandbox laboratory | System calls, processes, namespaces and resource controls | Inspect a bounded program's actual file/network behavior | Keep traces local; export counts | OS-specific but not yet a compelling Companion feature |

Cloudflare Workers currently document outbound TCP through `connect()` and no inbound TCP socket support. This distinction concerns the Workers runtime, not every product Cloudflare sells. A browser or Worker can simulate protocol logic; that is different from observing the Linux kernel itself. [Workers sockets](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/), [protocol support](https://developers.cloudflare.com/workers/reference/protocols/).

## 1. A laboratory for extremely small interactions

Linux `netem` supports delay, jitter, loss, duplication, corruption and reordering. Its manual also warns about timer granularity and where impairment should be applied for realistic TCP tests. These details matter: a plausible graph does not prove a realistic experiment. [netem manual](https://man7.org/linux/man-pages/man8/tc-netem.8.html).

Real experiments worth studying:

- [Chainbound's Linkem](https://engineering.chainbound.io/linkem) describes testing messaging software using isolated Linux peers and impaired links. This is a creator's implementation report, not our benchmark.
- [Sam Who's Emulating Bad Networks](https://samwho.dev/blog/emulating-bad-networks/) demonstrates putting impairments on virtual interfaces so the real network interface is not disturbed.
- [USI's network emulation exercise](https://www.inf.usi.ch/carzaniga/edu/adv-ntw25s/mininet.html) uses namespaces as lightweight isolated networks instead of separate virtual machines.
- [multiwan-testbed](https://github.com/joezbay/multiwan-testbed) is a published reproducible experiment around path selection and failover. Its broader topology is inspiration, not a dependency we need to install.

Proposed first experiment: replay an identical sequence of map/entity selections through immediate JSON messages, compact encoded messages, and a coalescing strategy that sends only the latest selection. Compare cold connection, warm connection, idle maintenance, reconnect, packet loss and interrupted delivery. Include sequence numbers so an older selection cannot overwrite a newer one.

Measure bytes per successfully applied selection, idle bytes per hour, reconnect cost, delivery delay and stale/duplicate application. Compression or binary encoding should earn their complexity through measurements; headers and connection establishment may dominate short payloads.

Keep both endpoints and the impaired link inside isolated namespaces without a public uplink. Packet captures stay local. Publish a small result artifact through Cloudflare. Local virtual traffic does not itself leave Google; SSH, result upload, updates and any accidental external access still count separately.

A native harness measures that harness. It does not establish Safari behavior or reproduce the Cloudflare edge. Follow promising results with real-browser tests of the existing room protocol, separately accounting for public traffic. Do not put the host's management interface under netem or expose an arbitrary command runner. Before implementation, inspect available kernel features and define narrowly scoped privileges and cleanup.

## 2. Make the invisible cost of a message visible

[Google's packetdrill](https://github.com/google/packetdrill) scripts socket calls and expected packets, including local tests through a virtual TUN device. It tests actual network stacks and supports several Unix-like systems. The [2025 NetDev presentation](https://netdevconf.info/0x19/docs/netdev-0x19-paper23-talk-slides/packetdrill%20-%20NetDev%202025-03-10.pdf) supplies a more recent technical entry point.

A possible education experience: choose a small message, lose an acknowledgement, and compare the resulting exchange. Linux runs a fixed reviewed scenario; the browser draws the result. This offers real observed behavior rather than just a conceptual animation. However, a precomputed trace may teach the same lesson without an always-on service. Begin with the trace before building a public runner.

## 3. Messages that tolerate absence

[LXMF](https://github.com/markqvist/LXMF/blob/master/README.md), built on Reticulum, supports store-and-forward delivery through propagation nodes. Its documented clients include Sideband, MeshChat and Nomad Network. It also supports encrypted messages carried as QR codes or text URIs. This creates an interesting connection between a networked directory and information carried across a temporary connectivity gap.

Possible experiment: deliver a short, explicitly time-limited public bulletin such as a changed service schedule, then reconnect a recipient and inspect delivery and expiry handling. The bulletin needs its source, verification time and expiry. This is not authorization to collect clients' circumstances or private encampment information, and it cannot certify that a service is open now.

Linux's role would be running the existing native router/daemon continuously. Store-and-forward as an abstract idea can also be implemented on Cloudflare. The reason to use this stack is interoperability with its clients and transports, not the invention of a queue.

Default propagation peering can synchronize messages across nodes. Start with isolated peers and review the exact current configuration before any public network participation. The VM has no LoRa radio: radio use requires a separate connected gateway and actual participating devices. Browser integration also needs investigation; it is not a drop-in Geo authentication feature. [Reticulum manual](https://reticulum.network/manual/using.html).

Community leads include an [AWS-hosted routing experiment and maintainer discussion](https://github.com/markqvist/Reticulum/discussions/1017), a [Reddit discussion of hosted nodes for separated IoT locations](https://www.reddit.com/r/reticulum/comments/1vy2dmq/any_interest_in_hosted_reticulum_rnsd/), and [experiments serving Reticulum pages](https://www.reddit.com/r/reticulum/comments/1usv7g0/reticulum_websites/). These demonstrate people exploring the approach; their performance, security and compatibility claims were not reproduced here. Reader-controlled text pages may be more relevant than a full graphical remote desktop.

## 4. Introduce peers without carrying their content

[Syncthing's discovery server](https://docs.syncthing.net/users/stdiscosrv.html) illustrates separating peer discovery from transfer. It is a native program, but its discovery interface is HTTPS, so this is not proof that discovery inherently requires Linux. Client-certificate and protocol compatibility still matter when considering alternative hosting.

[RustDesk server](https://github.com/rustdesk/rustdesk-server) separates rendezvous (`hbbs`) and relay (`hbbr`). A [community e2-micro setup report](https://www.reddit.com/r/rustdesk/comments/1rs0fzd/free_rustdesk_selfhosted_server_on_gcp_e2micro_a/) is a useful lead, but fitting in RAM does not establish low traffic. Native rendezvous is worth investigating only when we have native clients that need it. Relaying a failed direct connection changes the entire byte budget. Existing browser-to-browser selection rooms need no replacement.

## 5. Learn from public measurement networks without blindly joining

[RIPE Atlas software probes](https://atlas.ripe.net/docs/howtos/software-probes) show how a persistent Linux machine can become a measurement location. Its [technical FAQ](https://atlas.ripe.net/docs/faq/technical-details.html) describes typical traffic around 4 kb/s for IPv4-only probes and 6 kb/s with IPv6 in the stated measurement scenario; bandwidth settings are not promised hard limits. The FAQ's bandwidth figure is not a measured outbound billing figure for our VM.

That is enough to reject assuming a default probe is negligible. Prefer manually bounded tests against our own endpoints if we have an actual diagnostic question. A Google datacenter's view is not evidence about mobile reception in Indianapolis. Ordinary HTTP health checking remains possible without Linux.

## Byte accounting and proposed acceptance criteria

Decimal arithmetic over 30 days, illustrative rather than measured usage:

| Continuous rate or output | Monthly bytes before other traffic |
| --- | --- |
| 1 kb/s | 324 MB |
| 10 kb/s | 3.24 GB |
| One 600-byte output each minute | 25.92 MB |
| One 20 KB result each day | 0.6 MB |

Small application payloads do not include every handshake, acknowledgement, reconnect, synchronization, SSH session or update. Fan-out multiplies output. Rate limiting alone is not a monthly byte ceiling. None of these calculations establishes free-tier eligibility or an account spending cap.

Proposed lab acceptance: one reviewed experiment at a time, no public relay, no Geo/IPFS forwarding, no unbounded fan-out, at most 20 KB of exported results per run, and measured host-interface traffic plus an explicit allowance for administration. The 20 KB limit is a design target, not enforcement that exists today. Confirm CPU, memory, kernel features and remaining account budget before installation.

Avoid selecting an IPFS gateway, video/desktop relay, Tor Snowflake proxy or blockchain full node merely because someone reports that its process runs on a small VPS. Content volume and peer replication are separate from CPU/RAM. Nothing here proposes replacing the Geo API or retaining another copy of its history.

## Recommendation and remaining research

Start with the network laboratory if the objective is better micro-egress engineering. Start with a closed LXMF bulletin demonstration if the objective is an unusual user-facing experiment. Keep both independent of the production Companion until they produce a concrete benefit.

No benchmark, native daemon compatibility, radio integration or memory fit has been verified on linux-cloud. Reddit provided discovery leads and primary creator reports supplied the technical basis. Targeted X searches in this pass did not yield a usable specific experiment; the earlier browser report records its limited indexed X coverage. This is a focused shortlist, not an exhaustive survey or evidence of adoption.
