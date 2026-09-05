# Table pagination boundary

Snapshot: 2026-09-05

## Question

How should Table integrate local and externally paginated records while preserving its existing sorting, selection, source-index, and controlled-state contracts?

## Primary-source baseline

- [TanStack Table's pagination guide](https://tanstack.com/table/v8/docs/guide/pagination) distinguishes a complete local dataset from already-paginated external data through `manualPagination`. External pagination needs a supplied row count or page count. Its default page reset is disabled in manual mode. This establishes that pagination ownership and total counts are separate concerns; a count alone does not identify a dataset's shape.
- [Ant Design's Table source](https://github.com/ant-design/ant-design/blob/master/components/table/InternalTable.tsx) sorts before deriving `pageData`. Its sort handler passes `false` for pagination reset; its filter handler requests reset. Its external-data heuristic compares supplied record count with total count. An explicit mode avoids inheriting that size-dependent inference.
- [Ant Design's pagination hook](https://github.com/ant-design/ant-design/blob/master/components/table/hooks/usePagination.ts) clamps the rendered current page against the derived maximum, with at least page one. It separates that projection from user-triggered callbacks.
- [TanStack Table's selection guide](https://tanstack.com/table/v8/docs/guide/row-selection) distinguishes stored selected identifiers from available selected records: manually paginated data can retain off-page identifiers even though the selected-row model can only produce supplied records.

These sources inform the boundary rather than prescribe this repository's Interface. The controlling local contracts are [ADR-0007](../adr/0007-table-required-rowkey-and-selection-model.md), [ADR-0009](../adr/0009-pagination-client-and-navigation-modes.md), and [ADR-0018](../adr/0018-table-sort-source-identity.md).

## Recommended Interface

Add optional `pagination: boolean | TablePagination`. Omission and `false` preserve the existing unpaginated Table. `true` enables local paging with page one and ten records per page. The basic Table still requires only `columns`, `dataSource`, and `rowKey`.

The object Interface has two dataset modes:

- Local: `mode?: "local"`, optional `pageSize`, `value`, `defaultValue`, and `onValueChange`. Presence of `value` selects controlled state and ignores `defaultValue`, matching Table's sorting contract. An omitted callback permits read-only controlled presentation. Uncontrolled paging needs no callback because Table itself performs the complete operation. `total` is forbidden and derives from `dataSource.length`.
- External: `mode: "external"`, required `value`, `onValueChange`, and `total`, plus optional `pageSize`. `defaultValue` is forbidden. The caller supplies one page of records and owns fetching, request cancellation, and total consistency. Table never slices these records again.

Use one-based values to match the existing Pagination Compose. Reuse its control rendering and numeric normalization. Presentation configuration is limited to `hideOnSinglePage`, `aria-label`, and `className`. Forward these through an explicit allowlist. Do not expose navigation hrefs, arbitrary Pagination prop bags, size changers, or quick-jump inputs in this increment.

## Behavioral invariants

### Presentation and identity

Resolve row metadata against the supplied `dataSource` before either sorting or slicing. Local presentation is metadata, stable sorting, then page slicing. External presentation retains all supplied records; comparator sorting, when explicitly configured, only sorts that supplied page. For globally ordered external data, callers use `sorter: true` and return the ordered page.

Every existing index callback continues to receive the source-array index. This includes function `rowKey`, cell `render`, `rowClassName`, `getCheckboxProps`, and `onRowClick`. External indices refer to the supplied page array, not a fabricated global offset. Pagination must not change identity or mutate the supplied array.

### Sorting and reconciliation

Keep the current page when sorting changes, including clearing sorting. Sorting changes order, not total count. This follows the observed Ant Design sort boundary and avoids two separate state callbacks for one action. A controlled caller refusing a sort request therefore cannot accidentally reset its unrelated page state. Consumers wanting page-one sorting can update their controlled sort and page together inside `onSortChange`.

Normalize finite numeric inputs by truncation and safe-integer bounds, with the existing Pagination fallbacks for invalid values. Derive at least one page and clamp the effective current value for both rows and controls in the same render. Shrinking totals or changing page size silently reconciles uncontrolled storage; later growth must not resurrect a stale out-of-range page. Controlled out-of-range values stay caller-owned while rendering their clamped projection.

Disabling pagination or entering external mode retains the stored local preference. Re-enabling local pagination clamps that preference against the current local dataset. External navigation must never overwrite local state. `defaultValue` seeds initial local state rather than acting as a live page update.

Changes to props, including data, total, page size, controlled sort, or controlled page, never emit page, sort, or selection callbacks. External callers own fetching the valid page when their total changes; normalization is not a request scheduler.

### Selection

The header checkbox reads and changes only the visible page's selectable rows. Disabled and read-only rows remain excluded. Selecting or deselecting the page preserves selected keys outside that eligible subset, including other local pages and unavailable external pages.

Header additions retain source-array order within the visible subset, even when presentation is sorted. `onSelectedRowKeysChange(keys, rows)` continues to derive `rows` from the entire supplied `dataSource` in source order: local paging can return selected records from other local pages, whereas external paging cannot return records absent from the supplied page. No record cache is introduced.

### Controls

Render pagination as a sibling navigation landmark outside the table element. Table attributes, class names, and refs keep their existing table target. Loading disables paging and bulk selection while replacing the body. Empty external pages use the existing empty state even when the reported total is nonzero.

## Validation boundary

Prove local sorted slices, source indices, stable row keys, unchanged inputs, external no-double-slicing, controlled refusal, first/last-page controls, numeric normalization, shrink-then-growth reconciliation, and no callbacks from prop updates. Test page-scoped header selection with preserved off-page/disabled/read-only keys and source-ordered callback records. Include keyboard paging, loading, an empty external page, registry installation, and a fresh consumer build.
