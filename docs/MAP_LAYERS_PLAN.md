# Shared map layers: reference audit and plan

September 14, 2026. The shared point-map foundation is now implemented; area, line, analytical and offline layers below remain planned. Read alongside [living Geo design](LIVING_GEO_DESIGN.md), [education map](../LOCATION_MAP.md), and [outreach pilot](OUTREACH_LIVE.md).

## What the reference actually does

Inspected the local Data Extraction Tool's `amir-parser-ocr-pipeline/scripts/build_interactive_rate_map.py` and `app/main.py`. This was a source-code review, not a fresh rendered-browser audit. No customer records, generated map payloads, SQL credentials or business data were copied into Companion.

| Observed pattern | Reference implementation | Companion application |
| --- | --- | --- |
| Metric-driven colored areas | `html_document`, around line 330: GeoJSON polygon styling, metric selector, clickable legend buckets including no result | Color published service areas or study regions by a compatible, explicitly defined measure; missing values remain distinct from zero |
| Independent point overlays | `html_document_with_projects`, around line 355: layer groups and a dedicated pane above territories | Public service sites, contextual study locations, and later separately sourced transit stops |
| Geometry quality stays visible | Approximate external areas have dashed outlines and a visibility toggle | Distinguish a service-area boundary, an approximate area and an exact public site; don't turn a city centroid into a service address |
| One search across feature kinds | `html_document_with_search`, around line 424: customer, Census-place and utility search | Search loaded places/services/regions; show feature kind and zoom to selection |
| Overlap chooser | `chooseUtilityAt`/`utilitiesAt`: polygon containment and multiple-choice selection | Let people choose among coincident sites or overlapping service areas instead of hiding all but the top feature |
| Focus and restore | Territory focus, details panel, restore and fullscreen controls | Focus one provider or dataset and restore the previous view; keep controls usable on phones |
| Lightweight geography | Census-place centroid layer avoids loading place polygons | Fetch compact points first; load area geometry only when selected or enabled |
| Independent live evidence overlay | `app/main.py`, around line 1298: API-fed bill-verification outlines joined by utility ID | Refresh one layer without reloading boundaries or rebuilding the map |

The reference combines SQL/build-time geometry with a local live API overlay. Companion should use Geo adapters feeding browser-side layer models. Reuse the interaction patterns, not its data loader or generated HTML.

Do not carry over repeated script-string replacement, wrapping a global `render` function, fixed desktop overlay positioning, or unconditional 15-second polling. These make independent layers harder to maintain and do not fit our mobile/low-bandwidth goals. Use safe React details or text nodes for remote content.

## Proposed structure

Browser Geo reads → app-specific validation/normalization → shared layer model → Leaflet layer groups + accessible results list.

- **MapCanvas:** owns one Leaflet instance, basemap, panes, fit/restore controls and resize handling. Updating a layer should not recreate the map or reset the user's zoom.
- **Layer registry:** code owns supported renderer kinds and safe adapter capabilities. Geo collections supply membership, labels and supported facets. A new compatible entity needs no deployment; a new geometry or query capability may need code.
- **App adapters:** education preserves study/context-location meaning; outreach requires exact directory membership and public-stop gating. Shared rendering must not weaken either adapter's validation.
- **Layer controller:** enabled state, loading/error/partial states, bounded requests, cancellation/generation protection and cache policy per layer. One unavailable layer does not disable the rest.
- **Selection model:** identify a feature using network, asserting space, layer and entity IDs. Retain selection on rename; remove it when refreshed membership removes the entity. One place can support multiple service records.
- **Details and legend:** list alternative overlapping features, preserve service-to-place relations, show units and missing-value classes, and provide a keyboard-accessible list matching the map filters.

Illustrative internal model (not new Geo properties):

```ts
type MapLayer = {
  id: string;
  label: string;
  kind: 'points' | 'areas' | 'lines';
  state: 'loading' | 'ready' | 'partial' | 'unavailable';
  features: MapFeature[];
};
type MapFeature = {
  key: string; // network + asserting space + layer + entity
  entityId: string;
  spaceId: string;
  label: string;
  geometry: GeoJSON.Geometry;
  meaning: 'public-site' | 'context-location' | 'service-area';
  relatedEntityIds: string[];
};
```

Adapters convert coordinates once: GeoJSON uses longitude/latitude; Leaflet LatLng uses latitude/longitude. Keep geometry separate from result metrics. Preserve asserted geography/date/unit and unknown values; never silently combine conflicting space assertions.

## What Geo would need

**Already sufficient for the first layer:** the outreach pilot's explicit directory membership, service-to-public-stop links and typed Point. Education already has scoped location relations and coordinates, with different geographic meaning.

**For service-category layers:** stable category entity IDs and service relationships. Derive available categories from records, not a hardcoded list of provider names or name matching. Multiple categories may apply to one service; deduplicate shared places while retaining all services in details.

**For area layers:** explicit geometry or a supported public geometry reference, coordinate system, boundary date/version, geography meaning, source/attribution and service-to-area relation. Verify actual Geo schema and property IDs before proposing publisher changes. Polygon capability is not established by the current Point contract. Public immutable IPFS geometry could be fetched directly if its format, size, CORS and integrity are supported.

**For thematic colors:** a typed value, unit, denominator where applicable, observation period, spatial unit and defensible aggregation/comparison rule. A service count is not capacity, demand or unmet need. Education effect sizes are not interchangeable merely because they can be placed on a map.

**For time filters:** structured recurrence/timezone, verified freshness, exceptions and eligibility. Do not infer “open now” from description text or an undated weekly rule.

**For routes/transit:** explicit public line geometry and service meaning, source and allowed reuse. A visual radius is not walking time; polygon containment is not a confirmed referral or eligibility match. Never infer or expose private outreach routes or encampments.

## Suggested delivery order

1. **Shared foundation:** extract MapCanvas and layer controls; migrate both existing maps without changing their semantics. Add search-linked selection, same-location chooser, fit/restore and a mobile layer drawer. Keep only useful available controls visible.
2. **Indy service layers:** use publisher-supplied categories for toggleable overlays. Show multiple services at one place. Maintain the list when geometry is missing.
3. **Area context:** pilot one verified boundary dataset and explicit provider coverage relationships. Test holes, multipolygons, overlap selection, coordinates and differing dates. Use reviewed spatial tooling rather than copying ad hoc containment code blindly.
4. **Optional analytical layers:** compatible statistics, public transit and verified schedule filters after their data contracts exist. Add clustering or spatial indexing only when measured density/interaction costs justify them.
5. **Offline integration:** cache small validated layer snapshots and interface assets separately. Allow optional larger geometry downloads with size estimates and removal controls. Offline basemaps need a provider/licensing and storage plan; a cached service list must still work without tiles.

Load only enabled layers and fetch details on selection. Use bounded batches and cache revalidation rather than continual polling. Do not claim bounding-box filtering exists in Geo until verified; for small datasets, filter the validated snapshot in-browser. Persist layer choices locally by stable ID, ignoring removed or unsupported choices. Source snapshots stay disposable; Geo remains canonical.

## Acceptance criteria

- Identical map controls across apps, with app-specific data/privacy rules preserved.
- Changing a layer never unexpectedly resets viewport; errors and empty results are distinct.
- Geo additions, removals, renames and changed location links update without stale unioning.
- Filters apply consistently to pins, area styling, counts and the accessible list.
- Overlapping features remain individually selectable, including polygons with holes.
- Missing geometry stays discoverable in the list; no guessed coordinates, contacts or private locations.
- Mobile drawer, keyboard navigation, contrast and attribution work; map tiles are not required to read results.
- Per-layer fetch/feature/geometry limits and cache tests enforce the lightweight design.

The immediate next implementation should be the shared foundation and richer selection, not a large new geometry dataset. That provides reusable value with today's published data.

## Implemented foundation (0.3.3)

`src/shared/maps/MapCanvas.tsx` owns the Leaflet lifecycle for both apps. It supplies point layer toggles, fit/restore, a collapsible accessible list, selected-location details and coincident-point choices. Layer updates preserve the map instance and viewport; initial data fits once. Education search filters map points as well as its existing record list. Outreach aggregates service names under each public stop. The existing app adapters and privacy gates are unchanged. Each app currently supplies one meaningful point layer; no service categories or area geometry are invented. Layer choices are currently in-memory, not persisted. Polygon support, independent per-layer fetching, analytical legends and offline loading remain future phases.
