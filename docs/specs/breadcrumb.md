# Spec — Breadcrumb (Compose layer)

`registry/ui/breadcrumb.tsx`. Flattens shadcn Breadcrumb markup parts into one `items`-driven
component. AGENTS.md names Breadcrumb as the canonical list-type example.

## Ground truth (shadcn primitives, components/ui/breadcrumb.tsx)
- `Breadcrumb` = `<nav aria-label="breadcrumb">`, `BreadcrumbList` = `<ol>`,
  `BreadcrumbItem` = `<li>`, `BreadcrumbLink` = `<a>` (base-ui useRender, hover style),
  `BreadcrumbPage` = `<span role=link aria-current=page>` (current, not a link),
  `BreadcrumbSeparator` = `<li aria-hidden>` (default chevron, accepts children),
  `BreadcrumbEllipsis` = `<span>` with “…” + sr-only "More".
- Separators are interleaved BETWEEN items.

## API
```ts
export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;          // → BreadcrumbLink (plain <a>). Omit for plain text / current.
  current?: boolean;      // force this item as the current page (BreadcrumbPage)
}

export interface BreadcrumbProps extends Omit<ComponentProps<"nav">, "children"> {
  items: BreadcrumbItem[];
  separator?: ReactNode;          // override default chevron
  maxItems?: number;              // max items to display; collapse middle into "…" beyond it
  listClassName?: string;         // BreadcrumbList (ol)
  itemClassName?: string;         // every BreadcrumbItem (li)
  linkClassName?: string;         // every BreadcrumbLink
  pageClassName?: string;         // current BreadcrumbPage
  separatorClassName?: string;    // every BreadcrumbSeparator
}
```

## Current-page detection
`isCurrent(item, i) = item.current ?? (!anyExplicitCurrent && i === lastIndex)`
- If any item sets `current: true`, only those are pages (last is NOT auto-current).
- Else the last item is the current page.
- Current page ignores `href` (renders BreadcrumbPage, no link).
- Non-current with `href` → BreadcrumbLink; non-current without `href` → plain label text.

## Collapse (maxItems)
- Single knob: `maxItems` = max items to display. Collapse only when `items.length > maxItems`.
- Show the first item + `BreadcrumbEllipsis` + the last `maxItems - 1` items
  (`tailStart = max(items.length - max(1, maxItems-1), 1)`, so head/tail never overlap and the
  last item — the current page — is always shown).
- Separators are interleaved around the ellipsis too.
- Static ellipsis (no expand-on-click → that's the 20%, use primitives).
- Asymmetric before/after collapse counts are intentionally NOT exposed (sub-20%, AGENTS.md §5).
  Users needing that compose the primitives directly.

## Keys (lint: noArrayIndexKey)
Precompute keyed entries; key = `"{index}-{href}"` / `"{index}-{label}"` / `"breadcrumb-{index}"`.
The original index is folded in so repeated hrefs/labels stay unique. The `key=` JSX attr references
a precomputed `.key` field (a derived string), never the bare map index — so noArrayIndexKey passes.

## Behavior / edge cases (tests)
1. Renders one entry per item; last item → BreadcrumbPage (aria-current=page), others → links.
2. Items with `href` render anchors with that href; without href + not current → plain text.
3. `current: true` on a middle item makes it the page and stops last from auto-currenting.
4. `separator` overrides the default separator content.
5. `maxItems` collapses to first + ellipsis + last `maxItems-1`; ellipsis is flanked by
   separators; no collapse when `items.length <= maxItems`.
6. className overrides land on list / item / link / page / separator slots.
7. Empty items → nav + empty list, no crash.

## Out of scope (→ primitives)
Framework `<Link>` (Next/router): pass `<Link>` as `label` (no href), or compose primitives.
Interactive expand-on-click ellipsis, dropdown-menu collapse, per-item arbitrary markup.

## Status
Implemented in `registry/ui/breadcrumb.tsx` (+ `breadcrumb.test.tsx`, 14 tests, 100% coverage).
Adversarial review applied: dropped `itemsBeforeCollapse`/`itemsAfterCollapse` (sub-20% per AGENTS.md
§5), single-knob `maxItems`, index-folded keys, hardened link/page tests.
