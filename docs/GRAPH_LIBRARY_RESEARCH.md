# Graph visualization research

Researched September 15, 2026 (measurements September 16 UTC) for the proposed standalone [People & Contributions and Research Debates apps](PEOPLE_AND_DEBATE_EXPLORE.md). No production dependency or deployment changed.

## Recommendation

Prototype **React Flow for Research Debates**, and compare **a small D3/SVG implementation against Sigma for People & Contributions**. Keep Cytoscape as the strongest candidate if one graph engine must support both apps, particularly if compound groups and graph operations become central. Do not commit to two engines until the same small Geo neighborhood has been tried in the shortlisted approaches.

This recommendation is a project-specific judgment: our initial graphs are bounded neighborhoods (roughly 20–50 visible nodes), not million-node overviews. Readable claims, explicit relation labels, accessible interaction and visual control matter more than maximum graph size. A beautiful overview that cannot explain an edge is not enough.

The two apps should share a neutral node/edge model, Geo adapters, cache and selection state. Their renderers may differ: a spatial people network and a legible argument diagram have different layout needs. All options here can draw local browser data; choosing a renderer does not require a new backend or sending Geo data to a visualization vendor.

## Measured download cost

These are **local bundle measurements**, not vendor claims or runtime benchmarks. esbuild 0.28.2, minified browser ESM, ES2022, production mode, gzip level 9. React/ReactDOM were external because Companion already ships them. Core dependencies are included; application code, data, images and fonts are excluded. Layout included only where named. Sizes are decimal kB, rounded. Different imports, bundlers and custom plugins change results; Cloudflare may negotiate Brotli instead.

| Candidate / tested imports | Gzip kB | What this includes |
| --- | ---: | --- |
| D3 force only | 5.5 | Simulation primitives; no renderer or interaction |
| D3 force + selection + zoom + drag | 21.4 | Building blocks; we implement SVG rendering, labels, keyboard navigation and UI |
| Sigma 3 + Graphology | 37.9 | Graph model and WebGL renderer; positions must be supplied |
| Sigma + Graphology + ForceAtlas2 | 40.9 | Above plus synchronous layout; worker setup not measured |
| force-graph | 60.2 | Canvas renderer, simulation and interactions; React wrapper not included |
| React Flow | 62.2 | 59.5 JS + 2.7 CSS; selected components; no automatic layout |
| React Flow + Dagre | 78.9 | 76.3 JS + 2.7 CSS; hierarchical layout added |
| Cytoscape.js | 142.0 | Core renderer, graph operations and built-in layouts; extensions extra |
| cosmos.gl | 183.2 | GPU graph engine; not the full Cosmograph product |
| Reagraph | 394.3 | GraphCanvas including relevant transitive Three/React Three dependencies |
| AntV G6 | 424.3 | Graph entry point and dependencies; a specially optimized custom build may differ |

Artifacts: [exact measurements](research/graph-bundle-measurements.json), [import/build script](research/measure-graph-bundles.mjs), [pinned direct dependencies](research/graph-bench-package.json), [registry snapshot](research/graph-package-registry.json). The experiment was isolated in ignored `work/graph-bench`; main package.json/lockfile were untouched. To reproduce, copy the pinned manifest as package.json into a scratch directory, install, then run the measurement script there. Transitive dependencies are not frozen in the documentation manifest, so a later resolution may differ. The retained numbers are the observed run, not a promise of exact future bytes.

## Candidates and styling tradeoffs

| Library | Visual strengths | Main cost or limitation | Fit here |
| --- | --- | --- | --- |
| **D3 modules + SVG** | Full CSS/SVG control: portraits, shapes, text, curved labeled edges, subtle transitions | D3 force is a layout engine, not a complete graph widget. We own collision handling, navigation, interaction and lifecycle | Best strict-bandwidth option for small, deliberately designed neighborhoods |
| **React Flow** | Actual React/HTML node cards, CSS theming, custom SVG edges; strong keyboard and screen-reader primitives | Requires chosen layout strategy; large text cards need careful routing. Disable editor affordances in read-only mode | Best first prototype for claims, paper cards and relevance assessments |
| **Sigma + Graphology** | Crisp spatial networks, focus/highlight, scalable WebGL overview; image/custom node programs available | Rich HTML cards belong in an overlay/sidebar; shaders/plugins add complexity; accessible graph navigation is application work | Strong People app choice when exploring larger networks becomes important |
| **force-graph** | Compact Canvas implementation; custom node/link drawing, arrows, images, highlighting | Canvas styling is drawing code rather than ordinary CSS. Labels and accessible navigation need deliberate work | Good fast route to a custom network, particularly if Canvas is preferred over SVG |
| **Cytoscape.js** | Extensive selector-driven styles, node shapes/images, compound groups, curved/directed edges and graph algorithms | Larger baseline; rich styles/high pixel density increase rendering cost. HTML-rich cards are less natural than React Flow | Best all-round single-engine fallback |
| **G6** | Broad gallery, custom elements, combinations/groups, behaviors and layouts | Largest measured baseline here; rich framework surface adds integration work | Strong visual reference; not first choice for current bandwidth target |
| **Reagraph** | React-oriented WebGL graph with layout, selection and menu conveniences | Three-based dependency stack is expensive for our small 2D neighborhoods | Attractive capability set, weaker micro-download fit |
| **cosmos.gl** | GPU layout and rendering for dense overviews | Hardware/rendering complexity and larger baseline; full claim cards/accessible semantics need surrounding UI | Reserve for an intentional large-network experiment |
| **vis-network** | Established Canvas network with configurable physics, images and hierarchical views | Not bundle-measured in this pass; default visual language would need substantial design | Viable alternative, not ahead of the shortlist |
| **VivaGraph/ngraph** | Modular ecosystem and inspiring large network projects | The VivaGraph package's latest release is old; evaluate individual ngraph modules separately | Inspiration and specialist tools, not an automatic new app dependency |

Primary references: [D3 force](https://d3js.org/d3-force), [React Flow custom nodes](https://reactflow.dev/examples/nodes/custom-node), [React Flow accessibility](https://reactflow.dev/learn/advanced-use/accessibility), [React Flow layout options](https://reactflow.dev/learn/layouting/layouting), [Sigma v3 architecture/demos](https://www.sigmajs.org/), [force-graph API and examples](https://github.com/vasturiano/force-graph), [Cytoscape documentation](https://js.cytoscape.org/), [G6 gallery](https://g6.antv.antgroup.com/en/examples), [Reagraph](https://github.com/reaviz/reagraph), [cosmos.gl](https://github.com/cosmosgl/graph), [vis-network](https://github.com/visjs/vis-network), [VivaGraph](https://github.com/anvaka/VivaGraphJS).

## Visual references worth opening

1. **[React Flow Turbo Flow](https://reactflow.dev/examples/styling/turbo-flow)** — directly inspected the rendered example. Dark cards, gradient borders, restrained glow, curved connections and clear typographic hierarchy demonstrate that node-based UI need not look like an administrative flowchart. Borrow card styling and selection treatment, not its code-pipeline semantics. Continuous glow animation is optional and should respect reduced motion.
2. **[Sigma Wikipedia visualization](https://www.sigmajs.org/demo/index.html)** — directly inspected the rendered 2,085-node / 5,409-edge example. Cluster colors, symbols and selectively visible labels are useful references. At full extent it is still visually dense; our app should begin with a focused neighborhood. The search field accepted input, but this pass did not validate all demo interactions or mobile performance.
3. **[Sigma custom rendering](https://www.sigmajs.org/storybook/?path=/story/custom-rendering--story)** — useful stable-version entry point for image and custom-node techniques. [v4 examples](https://v4.sigmajs.org/examples/) add an extensive styling gallery, but **v4 is prerelease** in the registry snapshot; do not copy v4-only APIs into v3 integration.
4. **[force-graph text nodes](https://vasturiano.github.io/force-graph/example/text-nodes/)** and **[neighborhood highlighting](https://vasturiano.github.io/force-graph/example/highlight/)** — text-node demo rendered in the browser. Its initial label overlap illustrates why custom drawing alone does not solve readable layout. The highlighting example is a useful implementation reference, not a separately benchmarked interaction here.
5. **[Cytoscape Wine & Cheese case study](https://blog.js.cytoscape.org/2019/12/19/wine-and-cheese/)** — unusually relevant focused exploration: selecting one item reorganizes its related neighborhood. The project describes mobile support and links MIT source. The live demo currently failed certificate validation in this browser; it was not bypassed or counted as a successful runtime check.
6. **[AntV G6 gallery](https://g6.antv.antgroup.com/en/examples)** — source for grouped networks, custom nodes and alternate layouts. Documentation reviewed; runtime gallery not verified in this pass.
7. **[Anvaka's Map of Reddit](https://github.com/anvaka/map-of-reddit)** and **[Map of GitHub](https://github.com/anvaka/map-of-github)** — inspiration for progressive exploration and a map-like sense of place. These are complete applications, not a tiny plug-in. The Reddit project describes a precomputed graph/layout pipeline and custom rendering; that is materially different from fetching live Geo neighborhoods. Visual proximity must not imply agreement, expertise or a verified relationship.

## Versions, licensing and maintenance signals

Registry observations, not a full dependency/license audit. Release recency is one signal, not proof of code quality; stable D3 modules can be useful despite infrequent releases. Repository star totals were not used as an expertise or maintenance metric.

| Package | Stable version observed | Published | Declared license |
| --- | --- | --- | --- |
| d3-force / selection / zoom / drag | 3.0.0 | June 2021 | ISC |
| sigma | 3.0.3 | 2026-04-30 | MIT |
| graphology | 0.26.0 | 2025-01-26 | MIT |
| force-graph | 1.51.4 | 2026-04-16 | MIT |
| @xyflow/react | 12.11.6 | 2026-09-01 | MIT |
| cytoscape | 3.34.3 | 2026-09-07 | MIT |
| @antv/g6 | 5.1.1 | 2026-05-08 | MIT |
| reagraph | 4.32.0 | 2026-06-25 | Apache-2.0 |
| @cosmos.gl/graph | 3.4.1 | 2026-08-13 | MIT |
| vis-network | 10.1.2 | 2026-08-19 | Apache-2.0 OR MIT |
| vivagraphjs | 0.12.0 | 2019-10-27 | BSD-3-Clause |

React Flow's core is MIT; some polished examples/support are Pro offerings. We can build custom cards with the free core; do not assume every gallery example's source is included. See [xyflow repository](https://github.com/xyflow/xyflow).

Do not confuse **MIT cosmos.gl** with the fuller **Cosmograph** product, whose [licensing page](https://cosmograph.app/licensing/) describes non-commercial free use and commercial licensing. That distinction makes a blanket “Cosmograph is free/open-source” recommendation inappropriate for our reusable app.

## How to make ours attractive and useful

These are proposed design choices, not capabilities automatically delivered by any dependency:

- People: portraits only when the user's image preference permits; otherwise distinctive initials/shapes. Small role labels distinguish author, curator, organization and contributor. Node size stays neutral unless a named, scoped metric is explicitly selected.
- Debates: a central proposition, short connected argument cards and expandable paper sources. Supports/opposes/related have labels and different line patterns as well as color. Do not force every debate into a binary tree or duplicate the same paper into unrelated identities.
- Semantic zoom: simple shapes at overview; names at neighborhood scale; full claim text in the selected card/sidebar. Never make reading a paragraph depend on pinching to extreme zoom.
- Preserve positions and camera when new data arrives. Place newly expanded nodes locally instead of rerunning the entire graph into a new arrangement. A short settling animation can communicate change; perpetual physics obscures it.
- Use the existing teal/cream and dark palettes, generous label spacing, subtle edge contrast and strong focus states. Reserve glow for selection and use restrained animation. “Supports” does not mean true, and “opposes” does not mean false.
- A selected relationship must explain its direction, source and scope. Proximity is layout, not evidence. Relevance assessments stay distinct from the underlying academic claims and their community responses.
- Use mobile bottom sheets or a list/graph switch, readable touch targets, and an explicit fit/reset control. Keyboard navigation and an equivalent relationship list are acceptance requirements, not optional polish.

## Efficient integration

Lazy-load the selected app's renderer; visitors opening Education or Outreach should download none of it. Retain one shared typed graph model and scoped browser cache; renderer state must never become canonical Geo content. Fetch one-hop neighborhoods on demand with the existing completeness/error gates.

Clone adapter data before giving it to mutating layout engines. D3 explicitly mutates simulation nodes. Dispose of renderers, workers, listeners and animation loops on unmount. Stop simulations after bounded settling and pause hidden tabs. Do not interpret faster WebGL rendering as lower battery use without measurements.

Avatars can outweigh the renderer: ten 50 kB images cost more than any shortlisted core. Reuse the existing image download preference, limit visible image loading and cache immutable IPFS content. Never prefetch all people portraits merely to populate a graph.

All browser-local filtering, zoom and selection should avoid new API calls; explicit expansion fetches additional relationships. Layout coordinates are local presentation state. Geo edits to names, membership, relationships and relevance claims must appear after refresh without rewriting the app.

## Prototype decision gate

Next step is a small comparative prototype, not a production library commitment:

1. Use the same verified Geo subgraph and preserved edge semantics in each renderer. Start with 25–50 nodes, long names, multiple roles, parallel/cyclic relationships, missing images and cross-space provenance; synthetic fixtures are clearly labeled when required.
2. Compare a D3/SVG people neighborhood with Sigma, and a React Flow debate using a small hierarchical layout. If shared implementation cost dominates, try Cytoscape for both before committing.
3. Check 390px and desktop, light/dark, keyboard, reduced motion, image opt-out, failed API reads, missing WebGL and live member removal. Keep a usable list when a renderer cannot run.
4. Measure **actual lazy chunks**, first useful rendering, interaction delays, memory, idle activity and API bytes on an ordinary phone. This research measured bundles only; it did not establish Safari/iPhone FPS, memory, battery or accessibility compliance.
5. Initial budget proposal: under 100 kB gzip incremental renderer/layout for each app, no renderer bytes on the selector, and no continuous animation while idle. Treat these as targets to validate, not achieved production guarantees.

Current recommendation: React Flow earns its modest download through readable cards and built-in interaction support; D3 earns consideration through minimal bytes and unrestricted SVG styling; Sigma earns consideration through inexpensive scalable network rendering. G6/Reagraph/Cosmos should need a demonstrated requirement before accepting their larger baseline in this project.
