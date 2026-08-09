# Pagination separates client page changes from route navigation

shadcn's Pagination primitive renders anchors, while the Compose component also needs to support client-side data paging. Treating both as one click contract is unsafe: a route link that also fires a client-state callback can mutate the current tab when the user intended to open another page with a modifier or middle click. Pagination therefore exposes two mutually exclusive destination modes instead of mixing anchor navigation with local state.

## Decision

- **Client mode** omits `getPageHref`, requires `onValueChange`, and uses the Compose controlled vocabulary `value` / `defaultValue` / `onValueChange`. Generated anchors have no `href`, expose button semantics, implement Enter and Space activation, and update internal state only in the uncontrolled form. The controlled and uncontrolled forms are mutually exclusive in the type.
- **Navigation mode** requires both a controlled `value` and a pure, deterministic `getPageHref(page)` function. It renders genuine links and does not accept `defaultValue` or `onValueChange`, so ordinary, modified, middle-click, copy-link, and open-in-new-tab behavior remains native.
- `total` is a non-negative item count and `pageSize` is a positive item count per page. Every finite numeric input is truncated before its lower bound is applied. `total`, `pageSize`, `value`, and `defaultValue` are capped at `Number.MAX_SAFE_INTEGER`, so generated page targets are always safe integers; `boundaryCount` and `siblingCount` are capped at 100, which bounds render work even when the derived page count is enormous. Non-finite inputs use the documented prop-specific fallbacks. The component derives a page count of at least one, clamps the effective current value for rendering, and only emits normalized in-range values after user activation. A controlled out-of-range value is not corrected by a callback; uncontrolled state reconciles silently when `total` or `pageSize` shrinks.
- The component is a **thin-but-algorithmic wrapper**, not a Table/Select-style state machine. It owns one scalar value plus the deterministic boundary/sibling/ellipsis window. Size changers, quick jumpers, simple mode, responsive measurement, custom item renderers, and arbitrary item structures remain primitive composition.

## Consequences

- Every valid client-mode use has an observable destination callback; `total` alone is not presented as a complete data integration.
- Navigation links never have a second, surprising client-state side effect, including on modified clicks.
- The public state names stay aligned with the Compose controlled vocabulary in ADR-0004 instead of importing antd's `current` / `defaultCurrent` / `onChange` synonyms.
- The two modes introduce an intentional mutual-exclusion contract. Their JSDoc and type tests must keep that relationship explicit.
