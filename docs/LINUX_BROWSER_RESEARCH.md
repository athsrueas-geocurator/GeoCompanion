# Linux and executable environments in the browser

Research date: September 12, 2026. This is an engineering research note, not the editor's published writing. No emulator, guest image, model or new service was installed or deployed. Cloudflare coordination is already deployed; its outstanding operational checks remain in TODO.md.

## Finding

The interesting opportunity is to attach a working environment to knowledge: let someone rerun an analysis, alter an assumption, inspect a historical tool, or learn by changing a small system. A terminal alone is not a compelling addition to Geo Companion.

Linux emulation is one way to supply that environment. Sometimes a smaller browser-native tool produces the same experience with substantially less machinery. Compare both on the same useful task before selecting an engine.

This investigation followed Reddit build reports, indexed X posts, Hacker News discussions, creator repositories, and official documentation. Community performance reports are attributed observations, not independently reproduced benchmarks. Repository capability lists are maintainer claims unless stated otherwise. X coverage was limited: indexed text was accessible for two relevant posts, while opening their full threads failed or returned no text. No claim of an exhaustive X survey is made.

## What “Linux in a browser” can mean

| Approach | Examples | What actually runs | Main implication |
| --- | --- | --- | --- |
| Emulate a computer | v86, JSLinux/TinyEMU, LinuxPDF | Guest CPU instructions, kernel and programs | Broad compatibility within the emulated hardware's limits; an OS image and emulator must be delivered |
| Translate binaries and implement Linux calls | CheerpX/WebVM | Existing x86 user programs with a Linux syscall implementation | Linux-compatible software does not necessarily mean a guest Linux kernel is booting |
| Port Linux to a Wasm architecture | joelseverin/linux-wasm | A modified Linux kernel targeting Wasm | A distinct research approach, not ordinary x86 emulation |
| Implement a POSIX environment for Wasm programs | Kandelo | Wasm-compiled tools with processes, files and system calls | More general than one isolated Wasm function, but not automatically compatible with arbitrary downloaded ELF binaries |
| Port the specific application | PGlite; WordPress Playground's runtime approach | A database or application stack adapted to browser execution | Often the better baseline when only one capability is needed |

Sources: [v86](https://github.com/copy/v86), [WebVM](https://github.com/leaningtech/webvm), [linux-wasm](https://github.com/joelseverin/linux-wasm), [Kandelo](https://github.com/Automattic/kandelo), [PGlite](https://pglite.dev/). These categories describe execution mechanisms, not a performance ranking.

## Experiments worth studying

### 1. A real machine that can be resumed: v86

The upstream project documents browser networking examples, programmatic terminal access, and saving/restoring emulator state. It supports 32-bit Linux kernels, not 64-bit kernels. Its emulator is BSD-2-Clause; guest software and images have separate licensing considerations. [Primary repository](https://github.com/copy/v86)

**Possible adaptation:** a lesson opens at an interesting moment, with a file already loaded and a calculation ready to change. Students can reset it without setup. A saved machine state is not proof that arbitrary execution will replay deterministically across browsers or emulator versions.

### 2. Existing Linux tools with a browser interface: WebVM / CheerpX

WebVM runs Linux-compatible environments using x86-to-Wasm translation, a virtual filesystem and syscall emulation. Its repository describes Tailscale networking, with an exit node for general internet access. That networking option introduces another machine and traffic path. [Primary repository](https://github.com/leaningtech/webvm)

The licensing distinction matters here: the WebVM shell is Apache-licensed, but CheerpX has separate terms. Its current licensing page advertises a free community edition for personal/FOSS uses while excluding self-hosting and redistribution. The README's organizational-use language is more restrictive than that summary; resolve the applicable terms before treating it as a freely redistributable dependency. [Provider licensing](https://cheerpx.io/licensing)

**Possible adaptation:** a specialist analysis tool that cannot reasonably be ported. Keep the official demo as a research comparison before committing to the engine.

### 3. Turn a container into a browser experiment: container2wasm

The project converts container images into Wasm environments and supplies browser examples. It distinguishes Fetch-based networking, which retains browser CORS restrictions, from a WebSocket mode that uses an external network helper. Offline/no-network mode is also documented. [Primary repository](https://github.com/container2wasm/container2wasm)

**Possible adaptation:** package an existing open-source education analysis workflow so readers can execute its actual toolchain. The unresolved questions are image size, execution time and useful compatibility—not whether a container can technically boot. Build-time Docker does not imply visitors need Docker or that linux-cloud must serve them.

### 4. Linux without an emulated x86 underneath: linux-wasm

Joel Severin's repository adds Wasm architecture support and documents `wasm32_nommu` and `wasm64_nommu` variants. This is a kernel/toolchain research project. [Primary repository](https://github.com/joelseverin/linux-wasm)

A November 2025 Reddit thread includes both successful interaction and crash reports. Those reports make useful test cases, not a current reliability verdict. [Discussion](https://www.reddit.com/r/linux/comments/1oncgjh)

**Possible adaptation:** a genuinely unusual systems-learning exhibit. It is not my first choice for a dependable outreach tool.

### 5. A whole Unix-style process environment: Kandelo

Automattic describes Kandelo as research into a POSIX-compatible Wasm kernel. Its examples include shells, Git, CPython, nginx, PHP and database software, using a shared kernel and Web Workers. Those are maintainer-reported capabilities; compatibility and resource use still need measurement for our workload. [Primary repository](https://github.com/Automattic/kandelo)

**Possible adaptation:** an editor-controlled workbench in which a visual interface drives existing command-line tools. The promising feature is composability—pipes, files and processes—rather than presenting everyone with a desktop.

### 6. PostgreSQL as an appliance, then as a smaller component

Snaplet's older postgres-wasm runs PostgreSQL in the browser. The repository is archived and explicitly points readers toward newer alternatives. Its creator's 2022 HN discussion describes a v86/Buildroot implementation and a roughly 12 MB CPU/memory snapshot. That number is historical and is not total current transfer or RAM usage. [Repository](https://github.com/snaplet/postgres-wasm), [creator discussion](https://news.ycombinator.com/item?id=33067962)

PGlite now offers browser-local Postgres and advertises a core Wasm build under 3 MB gzipped; extensions and datasets add to that. [Primary project](https://pglite.dev/)

**Possible adaptation:** join education and outreach records locally, inspect coverage, or let a reader change a query. Use this pair as a test of whether a full OS is actually earning its download.

### 7. Describe an environment with a small recipe: WordPress Playground

Playground Blueprints are JSON specifications that configure an instance; the documentation also describes bundles containing a blueprint and its resources. [Blueprint documentation](https://wordpress.github.io/wordpress-playground/blueprints/). Its browser execution architecture is documented separately and does not depend on booting a Linux guest. [Architecture](https://wordpress.github.io/wordpress-playground/developers/architecture/)

**Possible adaptation:** Geo stores a reviewed experiment recipe containing input references, tool version and parameters. Companion supplies the runner. The useful idea is a reproducible recipe that reconstructs a workspace—not embedding WordPress or automatically executing arbitrary instructions from Geo.

### 8. Historical software as context: OldWeb.today

OldWeb.today combines emulated browsers and archived pages. Its current client architecture differs from its older server-side container version. It documents a Cloudflare live-web proxy option and a static/local-archive option; remote archives and live web access can require a proxy. [Primary repository](https://github.com/oldweb-today/oldweb-today)

**Possible adaptation:** an education-history exhibit lets someone experience an old learning environment alongside a Geo discussion about technology. Archive rendering is a real use case for emulation. It is not a reason to add a general-purpose web proxy to the current Worker.

### 9. Preserve a source without preserving a whole machine: ReplayWeb.page

ReplayWeb.page renders web archives in the browser and offers an embeddable component. Its apparent backend is a browser service worker. [Project documentation](https://replayweb.page/docs/), [embedding](https://replayweb.page/docs/embedding/)

**Possible adaptation:** inspect a preserved public source beside a claim when the original page changes. This complements Geo's graph history: graph changes and the external source website are different things. It does not require Linux emulation, and it must not turn stale outreach schedules into current advice.

### 10. Linux inside a PDF

LinuxPDF runs a TinyEMU-derived RISC-V emulator through asm.js inside PDF JavaScript, with text fields and buttons for display/input. The author reports roughly 30–60 seconds to boot and severe performance loss in Chrome's PDF execution environment. [Primary repository](https://github.com/ading2210/linuxpdf)

**Possible adaptation:** inspiration for a downloadable document that contains an experiment. The PDF implementation itself is a poor fit for accessible, fast outreach work. A normal HTML package is a more plausible format to test.

### 11. A mature machine-in-a-page reference: JSLinux

Fabrice Bellard's site offers several CPU/OS/UI combinations, including Linux console and graphical environments. [Primary demo index](https://bellard.org/jslinux/)

**Possible adaptation:** a useful comparison demo when evaluating startup, interaction and how much general-purpose computing a browser can provide. Do not infer redistribution rights or measured mobile performance from being able to open the demo.

### 12. What happens when the whole-stack approach is too expensive?

A March 2026 JVM experiment's author initially described Linux/QEMU/Wasm with a 227 MB blob and a slow startup, then edited the post to report moving to OpenJDK compiled directly to Wasm. Treat both stages as the author's account, not independently verified measurements. [First-person Reddit build report](https://www.reddit.com/r/programming/comments/1rjb2io/i_put_a_full_jvm_inside_a_browser_tab_it_works/)

**Lesson:** preserve the ambitious user experience while being willing to remove the OS layer. The mechanism need not become the product.

### 13. An editor as a portable workspace

An Emacs builder described Alpine/v86 running Emacs, Org Mode and some Spacemacs configuration, explicitly acknowledging slowness. [First-person report](https://www.reddit.com/r/emacs/comments/1rznu4l/run_emacs_in_your_browser_with_v86/)

**Possible adaptation:** a preloaded research notebook with executable analysis and links back to Geo. First ask whether the notebook benefits from Emacs specifically; a browser-native reader/editor may be much more accessible.

### 14. RISC-V userland with an in-tab agent ambition

The userland.run author described a Rust/Wasm RISC-V environment and a goal of local agent execution. Replies raised performance concerns and alternative direct-Wasm approaches. The local-model portion is an ambition in this report, not something verified here. [First-person discussion](https://www.reddit.com/r/WebAssembly/comments/1un2pq8/i_built_a_riscv_linux_vm_that_runs_nodejs_v25_in/)

**Possible adaptation:** a local helper works only on the public data the reader selected. Model downloads, battery use and trust in generated commands are separate costs; “no cloud inference bill” is not the same as lightweight.

### 15. X's more speculative edge: an OS as a library

An indexed April 3, 2026 X exchange discusses a small Linux-like agent runtime that can mount a larger sandbox on demand; Andrew Jefferson then proposes an even more experimental model-plus-Wasm machine on a GPU. Full thread retrieval failed. [Indexed X post](https://x.com/EastlondonDev/status/2040123069973266782)

The associated agentOS repository describes an in-process backend runtime, not a verified drop-in browser Linux environment. Its performance ratios are vendor claims and were not adopted as measurements. [Primary repository](https://github.com/rivet-dev/agentos)

**Possible adaptation:** borrow the capability boundary: an agent gets a small reviewed tool surface, with additional capability made explicit. Do not assume this particular backend runtime belongs in our app.

A second indexed X post from OpenSilver describes a browser .NET IDE and emphasizes ordinary DOM interaction and accessibility. Full post retrieval returned no text. It is a discovery lead rather than evidence about Linux. [Indexed X post](https://x.com/OpenSilverTeam/status/2024246119375462642)

## Original proposals for Geo Companion

These are my design inferences from the research, not features claimed by the source projects or approved editorial content.

| Experiment | What a visitor actually does | Why it could be useful | Does Linux earn its place? |
| --- | --- | --- | --- |
| Re-run this finding | Open a study, inspect its inputs, alter a documented assumption, rerun the available calculation | Makes published analysis inspectable instead of treating a chart as an endpoint | Only if the original toolchain requires it; start with a smaller runner as the control |
| Fork this exploration | Copy a reviewed experiment recipe, change filters/parameters, share the recipe with another reader | A small shareable artifact explains how a result was reached | Usually no; recipes are the core idea |
| Education technology time capsule | Try a preserved learning tool alongside the editor's selected questions | Lets people experience a claim's context rather than only read about it | Yes when the historical software needs its original environment |
| Outreach coordination rehearsal | Move a hypothetical service's hours and inspect changes in geographic/time coverage | Makes complementarity and gaps tangible without editing real provider records | Probably no; local SQL and map logic should be the baseline |
| Agent workbench with visible actions | Give an agent a selected public dataset and watch a bounded transformation produce reviewable output | Demonstrates orchestration while keeping authorship and publication explicit | Maybe; compare POSIX Wasm tools with a much smaller function set |
| Shared experiment, separate computation | Two readers change a small common recipe while each computes locally | Extends the existing tiny-message room without streaming screens | No full VM synchronization needed; arbitrary machine-state replay is a separate hard problem |

My preferred first comparison is **one reproducible education analysis in a small browser-native runner versus a minimal Linux environment**. A more playful second experiment is the education technology time capsule. The current published estimates alone may not include original microdata or executable research code; availability and permission must be verified before promising reproduction of a paper.

## Where the bytes and costs move

Proposed accounting for each test:

`cold visitor transfer = interface + runtime + guest image blocks + selected data + other required assets`

`repeat visitor transfer = changed inputs + missing/evicted cached assets + optional coordination messages`

`operator VM egress = 0` is achievable while visitor transfer is still large. Caching reduces repeated transfer, not the first download. Demand-loading a large disk also does not make all of its contents available offline.

Cloudflare Pages has a 25 MiB per-asset limit; larger guest artifacts may require another delivery arrangement such as R2, whose storage/request terms must be checked separately. No R2 bucket was created by this research. [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)

Shared-memory implementations can require secure contexts and cross-origin isolation. That must be evaluated against existing third-party assets instead of enabling headers across the main site blindly. [SharedArrayBuffer requirements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)

Browser storage can be evicted. Offline environments need an explicit save/export path and a tested persistence strategy; browser cache is not the sole copy of someone's work. [Storage behavior](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

Networking remains the sharp boundary. Browser Linux does not acquire unrestricted sockets or bypass CORS by calling a command `curl`. Relays and exit nodes move the network work somewhere else. Prefer the existing browser Geo adapter supplying a bounded input file to an offline guest.

## A concrete evaluation plan

1. Choose a useful open analysis with redistributable inputs and a visible expected result. Pin its input revision separately from any live Geo query timestamp.
2. Implement the smallest viable browser-native version as a control, then one minimal v86 or container2wasm version. Keep both opt-in and outside the normal page load.
3. Measure cold/warm transferred bytes, time to first useful result, browser memory where measurable, CPU responsiveness and mobile thermal/battery behavior. Published numbers above are not our benchmark results.
4. Test offline after explicit preparation, storage eviction/recovery, cancel/reset, keyboard-only access, screen-reader access to results, and desktop plus an actual phone. Canvas screenshots are not an accessible results table.
5. If sharing is useful, exchange recipe IDs and bounded parameters through a new reviewed protocol. Do not send arbitrary shell commands through the current selection endpoint or assume two VMs execute deterministically.
6. Record engine/image versions, licenses, byte measurements and failure cases. Choose the mechanism based on task completion and accessibility rather than booting an impressive desktop.

No implementation choice is finalized. No downloads were benchmarked on the user's devices, no external posts were sent, and the Google Linux VM remains outside the deployed app.
