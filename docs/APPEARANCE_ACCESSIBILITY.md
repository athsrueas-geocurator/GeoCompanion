# System appearance and mobile layout

Implemented September 12, 2026. The user's “ww3 guide” request was interpreted as W3C accessibility guidance. These are targeted improvements and checks, not a claim of complete WCAG conformance.

## Shared implementation

`src/app/theme.css` owns semantic colors for page, surface, text, muted text, links, controls, focus, warnings and chart series. Existing feature styles use these roles instead of their previous independent light palettes. Import the shared theme and mobile rules from `src/main.tsx`; lazy-loaded feature CSS must not reset the palette.

The OS/browser preference controls the theme through `prefers-color-scheme: dark`. `color-scheme: light dark` also adapts native controls and scrollbars. HTML declares the supported color schemes early and provides matching media-specific browser theme colors. No local-storage override, JavaScript listener, dependency, API call or VM work is involved. Changing the system setting updates the existing page. Button foreground and background switch together without a mismatched-color transition.

Map tiles and published images retain their supplied colors. Map controls, popups and attribution use the theme. Leaflet overrides include `.geo-leaflet.leaflet-container` so vendor CSS loaded later cannot restore light-only attribution backgrounds. Both apps share this map class. Chart series use separate colors plus circle/diamond shapes and explicit labels; interpretation does not depend solely on hue.

## Mobile behavior

- Below 760px, a labeled native education-view select replaces the sideways-scrolling desktop navigation. It uses the same route registry; desktop retains its sidebar.
- Atlas filters place search first and use a compact wrapping grid. Long labels and content can wrap without widening the page.
- Mobile inputs/selects/textareas use 16px text, with controls generally at least 44px tall. Map zoom controls are 44px square. Inline prose links remain inline; these rules do not claim every hyperlink is a 44px box.
- Content has bottom clearance for shared-exploration controls. Overlays respect dynamic viewport height and safe-area insets. Wide numerical tables scroll within a labeled, keyboard-focusable region rather than widening the document.
- Atlas details use a native modal dialog. Tab/Shift+Tab stay within its controls; Escape and the close button restore focus to the opener. The detail modal sits above other app controls.
- Focus outlines include summaries and textareas; forced colors retain a system-highlight outline. Reduced-motion preferences suppress transitions/animations. Published curation links are underlined.

## W3C references and acceptance targets

- [CSS Color Adjustment](https://www.w3.org/TR/css-color-adjust-1/): negotiate supported color schemes rather than assuming a light canvas.
- [WCAG 2.2 contrast minimum](https://www.w3.org/TR/WCAG22/#contrast-minimum): 4.5:1 for ordinary text, 3:1 for qualifying large text.
- [Non-text contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast): 3:1 for meaningful control/focus/chart marks against adjacent surfaces. Decorative card dividers need not meet this threshold.
- [Reflow](https://www.w3.org/TR/WCAG22/#reflow): target 320 CSS px without document-level horizontal scrolling; wide data tables have their own scroll region.
- [Target size](https://www.w3.org/TR/WCAG22/#target-size-minimum): WCAG AA uses 24px with exceptions; our main mobile controls target 44px.
- [Focus visible](https://www.w3.org/TR/WCAG22/#focus-visible) and [focus not obscured](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum): visible keyboard focus and usable overlays.

## Verification and future changes

`npm test` includes `tests/theme.test.mjs`, calculating WCAG relative luminance from the actual theme tokens. It checks text/link roles on all three surfaces, control borders/focus, chart marks and warning/strong surface pairs in both schemes. Keep these tests when changing palette values; do not merely assert that a dark-mode media query exists.

Browser checks covered selector, dashboards, debates, curation, Connections, outreach map and preferences at 320, 390 and 1280 CSS px in both schemes: no document overflow. Atlas was also checked at phone width, with live results. Computed text-color checks exposed theme-transition and map-attribution issues, which were corrected and rechecked. Chart colors and native control sizes were inspected. The modal passed backward tab containment and Escape focus restoration; forced-colors emulation retained a 3px focus outline.

Before future deployments: run build/tests, emulate both schemes (including changing them without reloading), inspect desktop and 320/390px routes after their lazy styles/data load, open details and shared controls, test keyboard navigation, and verify Leaflet attribution. Inspect long real titles and numerical tables, not just empty/loading screens. Chromium emulation was used here; physical iOS/Android devices and a complete assistive-technology audit remain unverified.

## Preference control grouping — 0.4.2

Reading settings use individually bordered groups: native radio choices for text size and image loading, and a labeled button with role=switch for force-graph. Help text stays within its setting and is linked by aria-describedby. Selected choices have a visible radio mark and outline; the switch has On/Off text as well as position and color. Existing preference values and persistence are unchanged. Phone verification with Larger text enabled found no horizontal overflow at 375px; changing all three controls and reloading preserved the choices.
